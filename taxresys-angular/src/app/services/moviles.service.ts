import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { RangoFechas } from '../classes/rango-fechas';
import { AdherentesService } from './adherentes.service';
import { ChoferesService } from './choferes.service';
import { RequestService } from './request.service';
import { UsuariosService } from './usuarios.service';

@Injectable({
  providedIn: 'root',
})
export class MovilesService {
  //Listados
  listaAdherentes: any[] = [];
  listaChoferes: any[] = [];
  listaTipos: any[] = [];

  //Auxiliares
  fechasITV: RangoFechas;
  iniciado: boolean = false;
  movilesObs$: Subject<any>;

  constructor(
    private _conexion: RequestService,
    private _usuarios: UsuariosService,
    private _choferes: ChoferesService,
    private _adherentes: AdherentesService
  ) {
    console.log('Móviles listo');
    this.minMaxITV();
    //Instancia el objeto que será retornado como Observable
    this.movilesObs$ = new Subject();

    //Se suscribe a los cambios en el Módulo de Adherentes
    this._adherentes.adherentesObs$.subscribe((lista) => {
      console.log('---- Adherentes en Moviles Actualizado ----');
      this.listaAdherentes = lista;
    });

    //Se suscribe a los cambios en el Módulo de Choferes
    this._choferes.choferesObs$.subscribe((lista) => {
      console.log('---- Choferes en Moviles Actualizado ----');
      this.listaChoferes = lista;
    });
  }

  async cargarListas() {
    if (this._usuarios.user.logged) {
      await Promise.all([
        this.getLista('/adherentes'),
        this.getLista('/choferes'),
        this.getLista('/moviles/tipos'),
      ])
        .then((listas) => {
          [this.listaAdherentes, this.listaChoferes, this.listaTipos] = listas;
          this.iniciado = true;
        })
        .catch((error) => {
          console.log('Listas no cargadas', error);
          return error;
        });
    }
  }

  // Recuperación de Listados
  // Ruta pasada por parámetro
  //*******************************
  async getLista(listaUrl: string) {
    try {
      let lista = await this._conexion.request(
        'GET',
        `${environment.serverUrl}${listaUrl}`
      );
      //Emite la lista de Móviles para actualizar cualquier suscriptor
      if (listaUrl == '/moviles') {
        this.movilesObs$.next(lista);
      }
      return lista;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  //* Operaciones *
  //****************
  async detalleMovil(id: Number) {
    let movil: any;
    await this._conexion
      .request('GET', `${environment.serverUrl}/moviles/detalle/${id}`)
      .then((res: any) => {
        movil = res;
      })
      .catch((err) => (movil = err));
    return movil[0];
  }

  async nuevoMovilFull(nuevo: any) {
    let movil: any;
    await this._conexion
      .request('POST', `${environment.serverUrl}/moviles/nuevo`, nuevo)
      .then((res) => {
        movil = res;
        console.log('CREATE MOVIL', movil);
        this.afterChanges(movil);
      })
      .catch((err) => (movil = err));
    return movil;
  }

  async updateMovil(movil: any, id: Number) {
    let mov: any;
    await this._conexion
      .request('PATCH', `${environment.serverUrl}/moviles/detalle/${id}`, movil)
      .then((res) => {
        mov = res;
        console.log('UPDATE MOVIL', mov);
        this.afterChanges(mov);
      })
      .catch((err) => (mov = err));
    return mov;
  }

  //Métodos auxiliares
  //*****************************
  aniosValidos(rango: number): number[] {
    //Crea un arreglo de años válidos para los Móviles
    let anios: number[] = [];
    //Suma 1 al año actual por autos asentados con modelo del año siguiente
    let anio = new Date().getFullYear() + 1;

    for (let idx = 0; idx < rango; idx++) {
      anios.push(anio - idx);
    }
    return anios;
  }

  private minMaxITV(): void {
    let hoy = new Date();
    this.fechasITV = {
      actual: hoy,
      minimo: new Date(hoy.getFullYear() - 1, 0, 1),
      maximo: new Date(hoy.getFullYear() + 1, 11, 31),
    };
  }

  private async afterChanges(result: any) {
    // Recupera la lista de Móviles para actualizar todos los subscribers
    this.getLista('/moviles');

    // Recupera valores del objeto de respuesta del server
    let {
      action,
      resp: { actual, anterior },
    } = result;
    let aumentar: number;
    let reducir: number;

    // Actualiza el nro de móviles de los Adherentes involucrados
    aumentar = this.listaAdherentes.findIndex(
      (adh) => adh['adherente_id'] == actual
    );
    this.listaAdherentes[aumentar].moviles_activos += 1;

    if (action == 'updated' && anterior != actual) {
      reducir = this.listaAdherentes.findIndex(
        (adh) => adh['adherente_id'] == anterior
      );
      this.listaAdherentes[reducir].moviles_activos -= 1;
    }
  }
}
