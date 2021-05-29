export class Persona {
  persona_id: Number;
  apellido: string;
  nombre: string;
  direccion: string;
  telefono: string = null;
  email: string = null;
  fecha_nac: Date;

  constructor() {
    this.persona_id = 0;
    this.apellido = '';
    this.nombre = '';
    this.direccion = '';
    this.telefono  = '';
    this.email = null;
    this.fecha_nac = null;
  }
}
