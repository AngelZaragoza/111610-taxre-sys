import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root'
})
export class ChoferesService {

  constructor( private _conexion: RequestService ) {
    console.log('Choferes listo');
  }

  //Métodos de manejo de Choferes
  //*******************************
  async getChoferes() {
    let lista: any[] = [];
    await this._conexion.request('GET', `${environment.serverUrl}/choferes`)
      .then((res: any[]) => {
        lista = res.map((u) => u);
      })
      .catch((err: any) => {
        console.log(err);
        lista[0] = err;
      });

    console.log('Lista choferes:', lista);
    return lista;
  }

  async detalleChofer(id: Number) {
    let chofer: any;
    await this._conexion.request(
      'GET',
      `${environment.serverUrl}/choferes/detalle/${id}`
    )
      .then((res: any) => {
        chofer = res;
      })
      .catch((err) => (chofer = err));
    return chofer[0];
  }

  async nuevoChofer(detalle: any, nuevo: boolean) {
    let chofer: any;
    
    //Si 'nuevo' es true, se llama la ruta de POST que invoca el SP
    //Si nuevo es false, se llama la ruta de PUT que ejecuta un INSERT común
    let method:string = nuevo ? 'POST' : 'PUT';
    
    await this._conexion.request(method,`${environment.serverUrl}/choferes/nuevo`,detalle
    )
      .then((res) => (chofer = res))
      .catch((err) => (chofer = err));
    return chofer;
  }
  

  // ** Refactorear **
  // async updatePersona(persona: any, id: Number) {
  //   let pers: any;
  //   await this.request(
  //     'PUT',
  //     `${environment.serverUrl}/adherentes/detalle/${id}`,
  //     persona
  //   ).then((res) => (pers = res));
  //   return pers;
  // }

  // async updateAdherente(adherente: any, id: Number) {
  //   let adh: any;
  //   await this.request(
  //     'PATCH',
  //     `${environment.serverUrl}/adherentes/detalle/${id}`,
  //     adherente
  //   )
  //     .then((res) => (adh = res))
  //     .catch((err) => (adh = err));
  //   return adh;
  // }
}
