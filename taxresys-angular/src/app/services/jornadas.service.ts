import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ChoferesService } from './choferes.service';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class JornadasService {
  listadoMovilesJornadas: any[] = [];
  listaChoferes: any[] = []

  constructor(private _conexion: RequestService, private _choferes: ChoferesService) {
    //Se suscribe a los cambios en el Módulo de Choferes
    this._choferes.choferesObs$.subscribe(lista => {
      if(Array.isArray(lista)) {
        this.listaChoferes = lista;
        console.log('---- Choferes en Jornadas Actualizado ----');
      }
    })
    
    console.log('Jornadas listo');
  }

  async getMovilesJornadas() {
    try {
      let lista = await this._conexion.request('GET', `${environment.serverUrl}/jornadas`);
      this.listadoMovilesJornadas = <any[]>lista;
      return lista;
    } catch (error) {
      return error;
    }
  }
  
  async detalleJornada(id: string) {
    try {
      let jornada = await this._conexion
        .request('GET', `${environment.serverUrl}/jornadas/detalle/${id}`);
        return jornada[0];
    } catch (error) {
      return error;
    }   
  }

  /**
   * Almacena el Inicio o Cierre de la Jornada de un Móvil.
   * @param abreJornada true: llama la ruta de POST que ejecuta un INSERT  
   * false: llama la ruta de PATCH que ejecuta un UPDATE
   * @param jornada Los datos de la Jornada por iniciar o cerrar
   */
  async guardarJornada(abreJornada: boolean, jornada: any) {
    //Si 'abreJornada' es true, se llama la ruta de POST que ejecuta un INSERT
    //Si 'abreJornada' es false, se llama la ruta de PATCH que ejecuta un UPDATE
    let method: string = abreJornada ? 'POST' : 'PATCH';
    try {
      let result = await this._conexion
      .request(method, `${environment.serverUrl}/jornadas/iniciofin`, jornada);
      return result;
    } catch (error) {
      return error;
    }
  }
}
