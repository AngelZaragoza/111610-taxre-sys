import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Viaje } from '../classes/viaje.model';
import { MovilesService } from './moviles.service';
import { RequestService } from './request.service';
import { UsuariosService } from './usuarios.service';

@Injectable({
  providedIn: 'root',
})
export class ViajesService {
  //Listados
  tiposViaje: any[] = [];
  estadosViaje: any[] = [];
  listaChoferes: any[] = [];
  listaMoviles: any[] = [];
  listaPendientesActivos: any[] = [];
  
  //Auxiliares
  pendientesObs$: Subject<any>;
  isIniciado: boolean = false;

  constructor(
    private _conexion: RequestService,
    private _usuarios: UsuariosService,
    private _moviles: MovilesService
  ) {
    //Instancia el objeto que será retornado como Observable
    this.pendientesObs$ = new Subject();
    // this.cargarListas();
    
    this._moviles.movilesObs$.subscribe((lista) => {
      this.listaMoviles = lista;
      console.log('---- Moviles en Viajes Actualizado ----');
    })
    console.log('Viajes listo');
  }

  // Poblar las listas al inicio
  //*******************************
  async cargarListas() {
    if (this._usuarios.user.logged) {
      await Promise.all([
        this.getLista('/viajes/tipos'),
        this.getLista('/viajes/estados'),
        this.getLista('/choferes'),
        this.getLista('/moviles'),
      ])
        .then((listas) => {
          [
            this.tiposViaje,
            this.estadosViaje,
            this.listaChoferes,
            this.listaMoviles,
          ] = listas;
          this.isIniciado = true;
        })
        .catch((error) => console.log('Listas no cargadas', error));
    }
  }

  // Recuperación de Listados
  // Ruta pasada por parámetro
  //*******************************
  async getLista(listaUrl: string) {
    let lista: any[] = [];
    await this._conexion
      .request('GET', `${environment.serverUrl}${listaUrl}`)
      .then((res: any[]) => {
        lista = res.map((item) => item);
      })
      .catch((err: any) => {
        console.log(err);
        lista[0] = err;
      });
    console.log(`Lista ${listaUrl} => `, lista);
    return lista;
  }

  async getViajesTurnoActivo(turno: number) {
    let lista: Viaje[] = [];
    await this._conexion
      .request('GET', `${environment.serverUrl}/viajes/turno/${turno}`)
      .then((res: Viaje[]) => {
        lista = res.map((item: Viaje) => Viaje.viajeDesdeJson(item));
      })
      .catch((err: any) => {
        lista[0] = err;
      });

    // console.table(lista);
    return lista;
  }

  async getViajesEntreFechas(objQuery: any) {
    //Destructura el objQuery para facilidad de lectura
    let { fechaIni, fechaFin, cant, pag } = objQuery;

    let lista: Viaje[] = [];
    //Concatena los diferentes strings para la query
    let query = `ini=${fechaIni}&fin=${fechaFin}&cant=${cant}&pag=${pag}`;

    await this._conexion
      .request('GET', `${environment.serverUrl}/viajes/hist-fechas?${query}`)
      .then((res: Viaje[]) => {
        lista = res.map((item: Viaje) => Viaje.viajeDesdeJson(item));
      })
      .catch((err: any) => {
        lista[0] = err;
      });

    // console.table(lista);
    return lista;
  }

  async getPendientesActivos() {
    let lista: any[];
    await this._conexion
      .request('GET', `${environment.serverUrl}/viajes/pendientes/activos`)
      .then((res: any[]) => {
        lista = res;
        this.listaPendientesActivos = res;
        this.pendientesObs$.next(lista);
      })
      .catch((err: any) => {
        lista[0] = err;
        this.pendientesObs$.next(lista);
      });

    // console.log('Pendientes =>', lista);
    return lista;
  }

  //* Operaciones *
  //****************
  async nuevoViajeNormal(datos: Viaje) {
    let viaje: any;
    await this._conexion
      .request('POST', `${environment.serverUrl}/viajes/normal`, datos)
      .then((res) => (viaje = res))
      .catch((err) => (viaje = err));

    // console.log('Viaje normal', viaje);
    return viaje;
  }

  async nuevoViajePendiente(datos: Viaje) {
    let viaje: any;
    await this._conexion
      .request('POST', `${environment.serverUrl}/viajes/pendiente`, datos)
      .then((res) => (viaje = res))
      .catch((err) => (viaje = err));
    return viaje;
  }

  async asignaPendiente(datos: Viaje, pendienteId: number) {
    let viaje: any;
    await this._conexion
      .request(
        'POST',
        `${environment.serverUrl}/viajes/pendiente/${pendienteId}`,
        datos
      )
      .then((res) => (viaje = res))
      .catch((err) => (viaje = err));
    console.log('Asigna Pendiente =>', viaje);
    return viaje;
  }
}
