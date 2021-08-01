import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Viaje } from 'src/app/classes/viaje.model';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ViajesService } from 'src/app/services/viajes.service';

@Component({
  selector: 'app-viaje-historico',
  templateUrl: './viaje-historico.component.html',
  styles: [
    '.box-tabla { position: relative; height: 70vh; max-height: calc(70vh - 15vmax); overflow-y: scroll; margin: 5px 10px 10px 10px; }',
    '.cont-tabla { position: absolute; margin: 5px 10px 10px 10px;}',
  ],
})
export class ViajeHistoricoComponent implements OnInit {
  //Listados
  tiposViaje: any[] = [];
  estadosViaje: any[] = [];
  listaChoferes: any[] = [];
  listaUsuarios: any[] = [];
  listaMoviles: any[] = [];
  listaViajesFechas: Viaje[] = [];

  //Información del usuario y turno
  userLogged: any = {};
  userSub: Subscription;

  //Form y Objeto para consultas
  fechasViajes: FormGroup;
  objQuery: any = {};

  //Objeto modelo y auxiliares
  viaje: Viaje;
  errorMessage: string;
  loading: boolean;
  ready: boolean;

  constructor(
    private fb: FormBuilder,
    private _usuariosService: UsuariosService,
    private _viajesService: ViajesService
  ) {
    this.ready = false;
    this.errorMessage = '';
    this.userLogged = this._usuariosService.user;

    //Inicializar los controles del Form
    this.initForm();

    //Inicializa un objeto con fecha de inicio de un mes atrás
    //(resta 720 hrs a la fecha actual) y fecha actual como final
    this.objQuery = {
      fechaIni: this._usuariosService.calcularFechaMaxima(new Date(), -720),
      fechaFin: new Date(),
      cant: 1000,
      offset: 0,
    };

    console.log('objQuery:', this.objQuery);
  }

  ngOnInit(): void {
    this.getListas(this._viajesService.isIniciado);
    this.fechasViajes.setValue(this.objQuery);
  }

  initForm() {
    this.fechasViajes = this.fb.group({
      fechaIni: new FormControl('', Validators.required),
      fechaFin: new FormControl('', Validators.required),
      cant: new FormControl('', Validators.required),
      offset: new FormControl(''),
    });
  }

  //Métodos accessores
  //*******************
  get getTurno(): number {
    return this.userLogged.turno_id;
  }

  get getAlias(): string {
    return this.userLogged.alias;
  }

  get getFechaIni() {
    return this.fechasViajes.get('fechaIni');
  }

  get getFechaFin() {
    return this.fechasViajes.get('fechaFin');
  }

  get getCant() {
    return this.fechasViajes.get('cant');
  }

  get getOffset() {
    return this.fechasViajes.get('offset');
  }

  //Métodos del componente
  //**********************
  async getListas(isIniciado: boolean) {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'viaje_historico');

    //Se recuperan las listas con los datos para los Viajes
    if (!isIniciado) {
      await this._viajesService.cargarListas();
    }
    this.tiposViaje = this._viajesService.tiposViaje;
    this.estadosViaje = this._viajesService.estadosViaje;
    this.listaChoferes = this._viajesService.listaChoferes;

    //Se recuperan listas resumidas para mostrar datos mínimos
    //--------------------------------------------------------
    this.listaMoviles = await (
      await this._viajesService.getLista('/moviles')
    ).map((mov) => {
      return { movil_id: mov.movil_id, nro_interno: mov.nro_interno };
    });
    
    this.listaUsuarios = await (
      await this._usuariosService.getUsuarios()
    ).map((user) => {
      return { usuario_id: user.usuario_id, nombre: user.alias };
    });
    //--------------------------------------------------------
    
    //Se recuperan los viajes entre las fechas especificadas
    await this.getViajesEntreFechas('desdeInicio');

    this.loading = false;
    this.ready = true;
    this._usuariosService.mostrarSpinner(this.loading, 'viaje_historico');
  }

  async actualizarRango() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'historico_detalle');

    this.objQuery = this.fechasViajes.value;
    await this.getViajesEntreFechas('desdeForm');

    // this.loading = false;
    // this._usuariosService.mostrarSpinner(this.loading, 'historico_detalle');
  }

  async getViajesEntreFechas(origenRequest: string) {
    this.listaViajesFechas = await this._viajesService.getViajesEntreFechas(
      this.objQuery
    );

    //Si no hay viajes cargados, se recupera el mensaje de error
    if (this.listaViajesFechas[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.listaViajesFechas[0]['error']['message'];
    } else {
      this.errorMessage = '';
    }

    //Si se llama desde el Form, se oculta solamente la tabla al momento de consultar
    if (origenRequest == 'desdeForm') {
      this.loading = false;
      this._usuariosService.mostrarSpinner(this.loading, 'historico_detalle');
    }
  }
}
