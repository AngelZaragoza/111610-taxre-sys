import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RangoFechas } from '../classes/rango-fechas';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class MovilesService {
  listaChoferes: any[] = [];
  tiposMovil: any[] = [];
  aniosFabr: Number[] = [];
  fechasITV: RangoFechas;

  constructor(private _conexion: RequestService) {
    console.log('Móviles listo');

    //En Jesús María, la antigüedad máxima es de 10 años
    this.aniosFabr = this.aniosValidos(10);
    this.minMaxITV();
  }

  aniosValidos(rango: Number): Number[] {
    //Crea un arreglo de años válidos para los Móviles
    let anios: Number[] = [];
    //Suma 1 al año actual por autos asentados con modelo del año siguiente
    let anio = new Date().getFullYear() + 1;

    for (let idx = 0; idx < rango; idx++) {
      anios.push(anio - idx);
    }
    return anios;
  }

  minMaxITV(): void {
    let hoy = new Date();
    this.fechasITV = {
      actual: hoy,
      minimo: new Date(hoy.getFullYear() - 1, 0, 1),
      maximo: new Date(hoy.getFullYear() + 1, 11, 31),
    };
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
    await this._conexion.request('POST', `${environment.serverUrl}/moviles/nuevo`, nuevo)
      .then((res) => (movil = res))
      .catch((err) => (movil = err));
    return movil;
  }

  async updateMovil(movil: any, id: Number) {
    let mov: any;
    await this._conexion.request(
      'PATCH',
      `${environment.serverUrl}/moviles/detalle/${id}`,
      movil
    )
      .then((res) => (mov = res))
      .catch((err) => (mov = err));
    return mov;
  }
  
}
