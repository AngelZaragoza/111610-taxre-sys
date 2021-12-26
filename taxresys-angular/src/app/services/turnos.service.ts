import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class TurnosService {

  constructor(private _conexion: RequestService) {
    console.log('Turnos listo');
  }

  //* Listados *
  //****************

  /**
   * Recupera la cantidad especificada de Turnos registrados
   */
  async getUltimosNTurnos(cant: number) {
    try {
      let ultimos = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/turnos/ultimos/?cant=${cant}`
      );
      return ultimos;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  //* Operaciones *
  //****************
  /**
   * Recupera el último Turno registrado (más reciente)
   */
  async getUltimoTurno() {
    try {
      let turno = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/turnos/inout`
      );
      return turno;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  /**
   * Registra el inicio de un nuevo Turno
   */
  async inicioTurno(turno: any) {
    try {
      let result = await this._conexion.request(
        'POST',
        `${environment.serverUrl}/turnos/inout`,
        turno
      );
      return result;
    } catch (error) {
      console.error(error);
      return error;
    }

    // let turno: any;
    // this.pruebaRespuesta = await this._conexion
    //   .request('POST', `${environment.serverUrl}/turnos/inout`, inicio)
    //   .then((res: any) => {
    //     turno = res;
    //   })
    //   .catch((err) => {
    //     turno = err;
    //   });
    // return turno;
  }

  /**
   * Registra el cierre de un Turno previamente abierto
   */
  async cierreTurno(turno: any) {
    try {
      let result = await this._conexion.request(
        'PATCH',
        `${environment.serverUrl}/turnos/inout`,
        turno
      );
      return result;
    } catch (error) {
      console.error(error);
      return error;
    }

    // let result: any;
    // this.pruebaRespuesta = await this._conexion
    //   .request('PATCH', `${environment.serverUrl}/turnos/inout`, cierre)
    //   .then((res: any) => {
    //     console.log('Cierre Turno:', res);
    //     result = res;
    //   })
    //   .catch((err) => {
    //     console.log('Error Cierre Turno:', err);
    //     result = err;
    //   });
    // return result;
  }
}
