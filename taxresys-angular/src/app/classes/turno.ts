export class Turno {  

  turno_id: Number;
  usuario_id: Number;
  estado_pago_id: Number;
  hora_inicio: Date;
  hora_cierre: Date;
  horas_extra: Number;
  observaciones: string;

  constructor(usuario_id: Number) {
    this.turno_id = 0;
    this.usuario_id = usuario_id;
    this.estado_pago_id = 1;
    this.hora_inicio = new Date();
    this.hora_cierre = null;
    this.horas_extra = 0;
    this.observaciones = null;
  }
}
