import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nroMovil'
})
export class NroMovilPipe implements PipeTransform {

  transform(id: number, devolver: string, lista: any[] ): string {
    let result = lista.find((item) => item['movil_id'] == id);
    if (result) {
      return `${result[devolver]}`.padStart(2,'0');
    } else {
      return '--';
    }
    
  }

}
