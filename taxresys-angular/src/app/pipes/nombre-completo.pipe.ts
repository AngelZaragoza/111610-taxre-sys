import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nombreCompleto' })
export class NombreCompletoPipe implements PipeTransform {
  transform(id: number, clave: string, lista: any[]): any {
    //Arma un string con el nombre del primary key a buscar
    // let key = entidad + '_id';

    let result = lista.find((pers) => pers[clave] == id);
    if (result) {
      return `${result['apellido']} ${result['nombre']}`;
    } else {
      return '--';
    }
  }
}
