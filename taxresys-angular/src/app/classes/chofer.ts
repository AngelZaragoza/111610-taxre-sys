export class Chofer {
  persona_id: Number;
  chofer_id: Number;
  carnet_nro: string;
  carnet_vence: Date;
  habilitado: Number;

  constructor() {
    this.persona_id = 0;
    this.chofer_id = 0;
    this.carnet_nro = '';
    this.carnet_vence = null;
    this.habilitado = 1;
  }
}
