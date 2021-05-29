export class DTODetalleUsuario {
  persona_id: Number;
  usuario_id: Number;
  apellido: string;
  nombre: string;
  direccion: string;
  telefono: string = null;
  email: string = null;
  fecha_nac: Date;
  alias: string;
  password: string;
  rol_id: Number;
}
