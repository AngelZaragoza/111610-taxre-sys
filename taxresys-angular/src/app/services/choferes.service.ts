import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { RangoFechas } from '../classes/rango-fechas';
import { AdherentesService } from './adherentes.service';
import { RequestService } from './request.service';
import { UsuariosService } from './usuarios.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class ChoferesService {
  //Listados
  listaAdherentes: any[] = [];
  listaChoferes: any[] = [];

  //Auxiliares
  fechasCarnet: RangoFechas;
  choferesObs$: ReplaySubject<any>;

  constructor(
    private _conexion: RequestService,
    private _adherentes: AdherentesService,
    private _usuarios: UsuariosService,
    private _utils: UtilsService
  ) {
    //Instancia el objeto que será retornado como Observable
    this.choferesObs$ = new ReplaySubject(1);

    //Se suscribe a los cambios en el Módulo de Adherentes
    this._adherentes.adherentesObs$.subscribe((lista) => {
      if (Array.isArray(lista)) {
        console.log('---- Adherentes en Choferes Actualizado ----');
        this.listaAdherentes = lista;
      }
    });
    
    this.minMaxCarnet();
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
      this.listaChoferes = <any[]> lista;
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

  async nuevoChofer(nuevo: any, full: boolean) {
    try {
      //Si 'full' es true, se llama la ruta de POST 
      //Si full es false, se llama la ruta de PUT
      let method: string = full ? 'POST' : 'PUT';

      let chofer = await this._conexion.request(
        method,
        `${environment.serverUrl}/choferes`,
        nuevo
      );      
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

  //Métodos auxiliares
  //*******************************
  /** Crea un objeto con fechas límites de vencimiento del Carnet */
  private minMaxCarnet(): void {
    let hoy = new Date();
    this.fechasCarnet = {
      actual: hoy,
      minimo: this._utils.calcularFecha(hoy, 'm', -6),
      maximo: this._utils.calcularFecha(hoy, 'y', 5),
    };
  }
}
