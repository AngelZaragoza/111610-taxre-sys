import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nomElem'
})
export class NomElemPipe implements PipeTransform {

  transform(id: number, clave: string, lista: any[]): any {
    let result = lista.find((item) => item[clave] == id);
    if (result) {
      return `${result['nombre']}`;
    } else {
      return '--';
    }
  }

}
