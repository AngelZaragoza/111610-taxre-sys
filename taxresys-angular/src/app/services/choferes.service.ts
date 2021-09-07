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
      console.log(error);
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
      console.log(error);
      throw error;
    }
  }
  // async detalleChofer(id: Number) {
  //   let chofer: any;
  //   await this._conexion
  //     .request('GET', `${environment.serverUrl}/choferes/detalle/${id}`)
  //     .then((res: any) => {
  //       chofer = res;
  //     })
  //     .catch((err) => (chofer = err));
  //   return chofer[0];
  // }

  async nuevoChofer(detalle: any, nuevo: boolean) {
    let chofer: any;

    //Si 'nuevo' es true, se llama la ruta de POST que invoca el SP
    //Si nuevo es false, se llama la ruta de PUT que ejecuta un INSERT común
    let method: string = nuevo ? 'POST' : 'PUT';

    await this._conexion
      .request(method, `${environment.serverUrl}/choferes/nuevo`, detalle)
      .then((res) => {
        chofer = res;
        this.getChoferes();
      })
      .catch((err) => (chofer = err));
    return chofer;
  }

  // ** Refactorear **
  async updatePersona(persona: any, id: Number) {
    let pers: any;
    await this._conexion
      .request(
        'PUT',
        `${environment.serverUrl}/choferes/detalle/${id}`,
        persona
      )
      .then((res) => {
        pers = res;
        this.getChoferes();
      })
      .catch((err) => (pers = err));

    return pers;
  }

  async updateChofer(chofer: any, id: Number) {
    let chof: any;
    await this._conexion
      .request(
        'PATCH',
        `${environment.serverUrl}/choferes/detalle/${id}`,
        chofer
      )
      .then((res) => {
        chof = res;
        this.getChoferes();
      })
      .catch((err) => (chof = err));
    return chof;
  }
}
