import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdherentesService {
  constructor(private http: HttpClient) {
    console.log('Adherentes listo');
  }

  //Método principal para manejar los requests
  //******************************************
  private request(method: string, url: string, data?: any) {
    const result = this.http.request(method, url, {
      body: data,
      responseType: 'json',
      observe: 'body',
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    });

    return new Promise((resolve, reject) => {
      result.subscribe(resolve, reject);
    });
  }

  //Métodos de manejo de Adherentes
  //*******************************
  async getAdherentes() {
    let lista: any[] = [];
    await this.request('GET', `${environment.serverUrl}/adherentes`)
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
    await this.request(
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
    await this.request(
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
    await this.request(
      'PUT',
      `${environment.serverUrl}/adherentes/detalle/${id}`,
      persona
    ).then((res) => (pers = res));
    return pers;
  }

  async updateAdherente(adherente: any, id: Number) {
    let adh: any;
    await this.request(
      'PATCH',
      `${environment.serverUrl}/adherentes/detalle/${id}`,
      adherente
    )
      .then((res) => (adh = res))
      .catch((err) => (adh = err));
    return adh;
  }
}
