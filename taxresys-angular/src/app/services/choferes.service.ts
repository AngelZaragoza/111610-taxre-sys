import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdherentesService } from './adherentes.service';
import { RequestService } from './request.service';
import { UsuariosService } from './usuarios.service';

@Injectable({
  providedIn: 'root',
})
export class ChoferesService {
  //Listados
  listaAdherentes: any[] = [];
  listaChoferes: any[] = [];

  //Auxiliares
  choferesObs$: Subject<any>;

  constructor(
    private _conexion: RequestService,
    private _adherentes: AdherentesService,
    private _usuarios: UsuariosService
  ) {
    //Instancia el objeto que será retornado como Observable
    this.choferesObs$ = new Subject();

    //Se suscribe a los cambios en el Módulo de Adherentes
    this._adherentes.adherentesObs$.subscribe((lista) => {
      if (Array.isArray(lista)) {
        console.log('---- Adherentes en Choferes Actualizado ----');
        this.listaAdherentes = lista;
      }
    });
    console.log('Choferes listo');
  }

  //Métodos de manejo de Choferes
  //*******************************
  async getChoferes() {
    try {
      let lista = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/choferes`
      );
      //Emite la lista de Choferes para actualizar cualquier suscriptor
      this.choferesObs$.next(lista);
      return lista;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async detalleChofer(id: number) {
    try {
      let chofer = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/choferes/detalle/${id}`
      );
      return chofer[0];
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async nuevoChofer(detalle: any, nuevo: boolean) {
    try {
      //Si 'nuevo' es true, se llama la ruta de POST que invoca un SP
      //Si nuevo es false, se llama la ruta de PUT que invoca otro SP
      let method: string = nuevo ? 'POST' : 'PUT';

      let chofer = await this._conexion.request(
        method,
        `${environment.serverUrl}/choferes/nuevo`,
        detalle
      );
      // .then((res) => {
      //   chofer = res;
      //   this.getChoferes();
      // })
      // .catch((err) => (chofer = err));
      //Se emiten los datos mediante el Observable para actualizar la lista
      this._usuarios.personaObs$.next(chofer);

      return chofer;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async updateChofer(chofer: any, id: Number) {
    try {
      let chof = await this._conexion.request(
        'PATCH',
        `${environment.serverUrl}/choferes/detalle/${id}`,
        chofer
      );

      return chof;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
