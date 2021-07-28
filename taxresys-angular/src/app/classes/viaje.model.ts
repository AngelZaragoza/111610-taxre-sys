export class Viaje {
  static viajeDesdeJson(obj: Object) {
    return new Viaje(
      obj['viaje_id'],
      obj['usuario_id'],
      obj['turno_id'],
      obj['jornada_id'],
      obj['movil_id'],
      obj['chofer_id'],
      obj['tipo_viaje_id'],
      obj['estado_viaje_id'],
      obj['registrado'],
      obj['fecha_hora'],
      obj['origen_nombre'],
      obj['origen_altura'],
      obj['observaciones']
    );
  }

  constructor(
    public viaje_id: number,
    public usuario_id: number,
    public turno_id: number,
    public jornada_id: number,
    public movil_id: number,
    public chofer_id: number,
    public tipo_viaje_id: number,
    public estado_viaje_id: number,
    public registrado: Date,
    public fecha_hora: Date,
    public origen_nombre: string,
    public origen_altura: number,
    public observaciones: string
  ) {}
}
