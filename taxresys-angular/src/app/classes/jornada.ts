export class Jornada {
  static jornadaDesdeJson(obj: Object) {
      return new Jornada(
        obj['jornada_id'],
        obj['movil_id'],
        obj['chofer_id'],
        obj['turno_inicio'],
        obj['hora_inicio'],
        obj['turno_cierre'],
        obj['hora_cierre'],
      )
  }

  constructor(
    public jornada_id:   number,
    public movil_id:     number,
    public chofer_id:    number,
    public turno_inicio: number,
    public hora_inicio:  Date,
    public turno_cierre: number,
    public hora_cierre:  Date
  ) {}
}
