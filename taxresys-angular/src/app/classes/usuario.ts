export class Usuario {
  persona_id: Number;
  usuario_id: Number;
  rol_id: Number;
  alias: string;
  password: string;

  constructor() {
    this.persona_id = 0;
    this.usuario_id = 0;
    this.rol_id = 0;
    this.alias = '';
    this.password = '';
  }
}
