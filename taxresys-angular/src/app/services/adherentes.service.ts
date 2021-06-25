import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class AdherentesService {
  constructor(private _conexion: RequestService) {
    console.log('Adherentes listo');
  }
 

  //Métodos de manejo de Adherentes
  //*******************************
  async getAdherentes() {
    let lista: any[] = [];
    await this._conexion.request('GET', `${environment.serverUrl}/adherentes`)
      .then((res: any[]) => {
        lista = res.map((u) => u);
      })
      .catch((err: any) => {
        console.log(err);
        lista[0] = err;
      });

    console.log('Lista adherentes:', lista);
    return lista;
  }

  async detalleAdherente(id: Number) {
    let adherente: any;
    await this._conexion.request(
      'GET',
      `${environment.serverUrl}/adherentes/detalle/${id}`
    )
      .then((res: any) => {
        adherente = res;
      })
      .catch((err) => (adherente = err));
    return adherente[0];
  }

  async nuevoAdherenteFull(nuevo: any) {
    let adh: any;
    await this._conexion.request(
      'POST',
      `${environment.serverUrl}/adherentes/nuevo`,
      nuevo
    )
      .then((res) => (adh = res))
      .catch((err) => (adh = err));
    return adh;
  }

  async updatePersona(persona: any, id: Number) {
    let pers: any;
    await this._conexion.request(
      'PUT',
      `${environment.serverUrl}/adherentes/detalle/${id}`,
      persona
    ).then((res) => (pers = res));
    return pers;
  }

  async updateAdherente(adherente: any, id: Number) {
    let adh: any;
    await this._conexion.request(
      'PATCH',
      `${environment.serverUrl}/adherentes/detalle/${id}`,
      adherente
    )
      .then((res) => (adh = res))
      .catch((err) => (adh = err));
    return adh;
  }
}
