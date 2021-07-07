import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class TurnosService {
  pruebaRespuesta: any;

  constructor(private _conexion: RequestService) {
    console.log('Turnos listo');
  }

  async getUltimoTurno() {
    let turno: any;
    await this._conexion
      .request('GET', `${environment.serverUrl}/turnos/inout`)
      .then((res: any) => (turno = res))
      .catch((err) => (turno = err));
    return turno;
  }

  async inicioTurno(inicio: any) {
    let turno: any;
    this.pruebaRespuesta = await this._conexion
      .request('POST', `${environment.serverUrl}/turnos/inout`, inicio)
      .then((res: any) => {
        turno = res;
      })
      .catch((err) => {
        turno = err;
      });
    return turno;
  }
  
  async cierreTurno(cierre: any) {
    let turno: any;
    this.pruebaRespuesta = await this._conexion
      .request('PATCH', `${environment.serverUrl}/turnos/inout`, cierre)
      .then((res: any) => {
        console.log('Cierre Turno:', res);        
        turno = res;
      })
      .catch((err) => {
        console.log('Error Cierre Turno:', err);        
        turno = err;
      });
    return turno;
  }

}
