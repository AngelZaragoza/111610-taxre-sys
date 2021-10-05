import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ListadoService {

  constructor() { }

  // Chequear si es mejor hacer una versión que retorne el listado ordenado
  // en vez de mutar directamente el listado original (versión actual)
  /**
  * Ordena un array de objetos según el campo pasado por parámetro
  * @param listado   
  * un array de objetos sobre el cual se aplicará ordenamiento
  * @param campo   
  * una propiedad de los objetos del array usada para el ordenamiento
  * @param orden   
  * tipo de ordenamiento a aplicar. 'asc': ascendente - 'desc': descendente
  */
  ordenarListado(listado: any[], campo: string, orden: string) {
    let before: number = orden == 'asc'? -1 : 1;
    let after: number = orden == 'asc'? 1 : -1;
    if(typeof(listado[0][campo]) == 'string' ) {
      listado.sort((a, b) => {
        if(a[campo].toLowerCase() < b[campo].toLowerCase()) return before;
        if(a[campo].toLowerCase() > b[campo].toLowerCase()) return after;
        return 0;
      })
    } else {
      listado.sort((a, b) => {
        if(a[campo] < b[campo]) return before;
        if(a[campo] > b[campo]) return after;
        return 0;
      })
    }
    // return listado;
  }
}
