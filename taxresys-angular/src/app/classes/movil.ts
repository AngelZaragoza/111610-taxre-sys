export class Movil {
    movil_id: Number;
    adherente_id: Number;
    tipo_movil_id: Number;
    marca: string;
    modelo: string;
    descripcion: string;
    dominio: string;
    nro_habilitacion: Number;
    nro_interno: Number;
    anio_fabr: Number;
    chofer_pref: Number;
    fecha_itv: Date;
    seguro: string;

    constructor() {
        this.movil_id = 0;
        this.adherente_id = 0;
        this.tipo_movil_id = 0;
        this.marca = '';
        this.modelo = '';
        this.descripcion = '';
        this.dominio = '';
        this.nro_habilitacion = 0;
        this.nro_interno = 0;
        this.anio_fabr = 0;
        this.chofer_pref = null;
        this.fecha_itv = null;
        this.seguro = null;
    }
}
