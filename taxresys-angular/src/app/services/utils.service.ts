import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  ultimoOrden: string;
  componentDestroyed$: Subject<void>;

  constructor(private _spinner: NgxSpinnerService) {
    // Para controlar el último campo usado para 'ordenarListado'
    this.ultimoOrden = '';
    
    // Para terminar suscripciones en un componente al destruir el mismo
    this.componentDestroyed$ = new Subject<void>();
  }

  /**
   * Retorna un objeto Date a partir de una fecha base,
   * sumando o restando las unidades de tiempo especificadas.
   * @param fechaBase  Fecha que se
   * tomará como base para el cálculo
   * @param unidad
   * String para indicar
   * la unidad de tiempo.
   *
   * 'h'- horas
   * 'd'- días
   * 'm'- meses
   * 'y'- años
   * @param valor
   * Número para realizar el cálculo.
   * Puede ser positivo o negativo.
   */
  calcularFecha(fechaBase: Date, unidad: string, valor: number): Date {
    let totalMilisegundos = 1000 * 60 * 60;
    switch (unidad) {
      case 'h':
        totalMilisegundos *= valor;
        break;
      case 'd':
        totalMilisegundos *= valor * 24;
        break;
      case 'm':
        totalMilisegundos *= valor * 30 * 24;
        break;
      case 'y':
        totalMilisegundos *= valor * 365 * 24;
    }

    let nuevaFecha = new Date(fechaBase.getTime() + totalMilisegundos);
    return nuevaFecha;
  }

  mostrarSpinner(loading: boolean, name: string): void {
    if (loading) {
      this._spinner.show(name);
    } else {
      setTimeout(() => {
        this._spinner.hide(name);
      }, 500);
    }
  }

  // Chequear si es mejor hacer una versión que retorne el listado ordenado
  // en vez de mutar directamente el listado original (versión actual)
  /**
   * Ordena un array de objetos según el campo pasado por parámetro
   * @param listado un array de objetos sobre el cual se aplicará ordenamiento
   * @param campo una propiedad de los objetos del array usada para el ordenamiento
   */
  ordenarListado(listado: any[], campo: string) {
    let orden: string;
    if (this.ultimoOrden === campo) {
      orden = 'desc';
      this.ultimoOrden = '';
    } else {
      orden = 'asc';
      this.ultimoOrden = campo;
    }

    let before: number = orden === 'asc' ? -1 : 1;
    let after: number = orden === 'asc' ? 1 : -1;
    if (typeof listado[0][campo] === 'string') {
      listado.sort((a, b) => {
        if (a[campo].toLowerCase() < b[campo].toLowerCase()) return before;
        if (a[campo].toLowerCase() > b[campo].toLowerCase()) return after;
        return 0;
      });
    } else {
      listado.sort((a, b) => {
        if (a[campo] < b[campo]) return before;
        if (a[campo] > b[campo]) return after;
        return 0;
      });
    }
    // return listado;
  }
}
