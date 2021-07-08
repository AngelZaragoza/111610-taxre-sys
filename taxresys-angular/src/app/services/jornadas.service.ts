import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root'
})
export class JornadasService {

  constructor(private _conexion: RequestService ) { 
    console.log('Jornadas listo');
  }

  async detalleJornada(id: Number) {
    let jornada: any;
    await this._conexion
      .request('GET', `${environment.serverUrl}/jornadas/detalle/${id}`)
      .then((res: any) => {
        jornada = res;
      })
      .catch((err) => (jornada = err));
    return jornada[0];
  }

}
