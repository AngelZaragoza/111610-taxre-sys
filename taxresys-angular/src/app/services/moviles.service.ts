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
      if (Array.isArray(lista)) {
        console.log('---- Adherentes en Moviles Actualizado ----');
        this.listaAdherentes = lista;
      }
    });

    //Se suscribe a los cambios en el Módulo de Choferes
    this._choferes.choferesObs$.subscribe((lista) => {
      if (Array.isArray(lista)) {
        console.log('---- Choferes en Moviles Actualizado ----');
        this.listaChoferes = lista;
      }
    });
  }

  async cargarListas() {
    if (this._usuarios.user.logged && !this.iniciado) {
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
          this.iniciado = false;
          throw error;
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
  async detalleMovil(id: number) {
    try {
      let movil = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/moviles/detalle/${id}`
      );
      return movil[0];
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async nuevoMovilFull(nuevo: any) {
    try {
      let movil = await this._conexion.request(
        'POST',
        `${environment.serverUrl}/moviles`,
        nuevo
      );
      this.movilesObs$.next(movil);
      this.afterChanges(movil);
      return movil;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async updateMovil(movil: any, id: Number) {
    try {
      let mov = await this._conexion.request(
        'PATCH',
        `${environment.serverUrl}/moviles/detalle/${id}`,
        movil
      );
      this.movilesObs$.next(mov);
      this.afterChanges(mov);
      return mov;
    } catch (error) {
      return error;
    }    
  }

  //Métodos auxiliares
  //*****************************
  /** Crea un arreglo de años válidos de fabricación de los Móviles
   * @param rango  número en años para calcular el rango
   */
  aniosValidos(rango: number): number[] {    
    let anios: number[] = [];
    // Suma 1 al año actual por autos asentados con modelo del año siguiente
    let anio = new Date().getFullYear() + 1;

    for (let idx = 0; idx < rango; idx++) {
      anios.push(anio - idx);
    }
    return anios;
  }
  
  /** Crea un objeto con fechas límites de vencimiento del ITV */
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
    // this.getLista('/moviles');

    // Recupera valores del objeto de respuesta del server
    let {
      action,
      resp: { actual, anterior },
    } = result;
    let aumentar: number;
    let reducir: number;

    // Busca el index en el array de Adherentes usando la respuesta del server
    aumentar = this.listaAdherentes.findIndex(
      (adh) => adh['adherente_id'] == actual
    );

    // Actualiza el nro de móviles de los Adherentes involucrados
    switch (action) {
      case 'added':
        this.listaAdherentes[aumentar].moviles_activos += 1;
        break;
      case 'updated':
        // Si en el update cambió el Adherente, se actualizan valores
        if (anterior !== actual) {
          reducir = this.listaAdherentes.findIndex(
            (adh) => adh['adherente_id'] == anterior
          );
          this.listaAdherentes[aumentar].moviles_activos += 1;
          this.listaAdherentes[reducir].moviles_activos -= 1;
        }
        break;
      // Próximo: delete de Móvil
    }
    this._adherentes.adherentesObs$.next(this.listaAdherentes);
    
  }
}
