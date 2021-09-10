import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestService } from './request.service';
import { UsuariosService } from './usuarios.service';

@Injectable({
  providedIn: 'root',
})
export class AdherentesService {
  //Auxiliares
  adherentesObs$: Subject<any>;

  constructor(private _conexion: RequestService, private _usuariosService: UsuariosService) {
    //Instancia el objeto que será retornado como Observable
    this.adherentesObs$ = new Subject();
    console.log('Adherentes listo');
  }

  //Métodos de manejo de Adherentes
  //*******************************
  async getAdherentes() {
    try {
      let lista = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/adherentes`
      );
      //Emite la lista de Adherentes para actualizar cualquier suscriptor
      this.adherentesObs$.next(lista);
      return lista;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async detalleAdherente(id: Number) {
    try {
      let adherente = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/adherentes/detalle/${id}`
      );
      return adherente[0];
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async nuevoAdherenteFull(nuevo: any) {
    try {
      let adh = await this._conexion.request(
        'POST',
        `${environment.serverUrl}/adherentes`,
        nuevo
      );
      //Se emiten los datos mediante el Observable para actualizar la lista      
      this._usuariosService.personaObs$.next(adh);

      return adh;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
  
  async updateAdherente(adherente: any, id: Number) {
    try {
      let result: any = await this._conexion.request(
        'PATCH',
        `${environment.serverUrl}/adherentes/detalle/${id}`,
        adherente
      );

      return result;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
