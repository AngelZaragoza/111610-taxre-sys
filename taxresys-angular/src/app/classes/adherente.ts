export class Adherente {
  persona_id: Number;
  adherente_id: Number;
  moviles_activos: Number;
  observaciones: string;

  constructor() {
    this.persona_id = 0;
    this.adherente_id = 0;
    this.moviles_activos = 0;
    this.observaciones = '';
  }
}
