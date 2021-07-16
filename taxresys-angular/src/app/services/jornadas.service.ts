import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class JornadasService {
  constructor(private _conexion: RequestService) {
    console.log('Jornadas listo');
  }

  async detalleJornada(id: string) {
    let jornada: any;
    await this._conexion
      .request('GET', `${environment.serverUrl}/jornadas/detalle/${id}`)
      .then((res: any) => {
        jornada = res;
      })
      .catch((err) => (jornada = err));
    return jornada[0];
  }

  async guardarJornada(abreJornada: boolean, jornada: any) {
    let result: any;

    //Si 'abreJornada' es true, se llama la ruta de POST que ejecuta un INSERT
    //Si 'abreJornada' es false, se llama la ruta de PATCH que ejecuta un UPDATE
    let method: string = abreJornada ? 'POST' : 'PATCH';

    await this._conexion
      .request(method, `${environment.serverUrl}/jornadas/iniciofin`, jornada)
      .then((res) => (result = res))
      .catch((err) => (result = err));
    return result;
  }
}
