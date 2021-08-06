import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroChoferEstado',
  pure: false,
})
export class FiltroChoferEstadoPipe implements PipeTransform {
  transform(value: any[], filtros: any): unknown {
    let porChofer = [];
    porChofer = value.filter(
      (viaje) => filtros.chofer == '' || viaje.chofer_id == filtros.chofer
    );

    // if (porChofer.length == 0) return porChofer;

    let estados = filtros.estados.filter((est) => est.chk);
    let porEstados = porChofer.filter((viaje) =>
      viaje.estado_viaje_id.includes(estados.id)
    );

    return porEstados;
  }
}
