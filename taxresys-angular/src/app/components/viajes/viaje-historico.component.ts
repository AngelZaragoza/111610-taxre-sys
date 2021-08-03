import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
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
    '.box-tabla { position: relative; height: 80vh; max-height: calc(80vh - 10vmax); overflow-y: scroll; }',
    '.cont-tabla { position: absolute; margin: 5px;}',
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

  //Objetos para consultas
  objQuery: any = {};
  desdeHasta: any = [];
  optFiltro: any = {};

  //Auxiliares  
  errorMessage: string;
  loading: boolean;
  ready: boolean;
  rangoValido: boolean;
  filtering: boolean;

  constructor(
    private _usuariosService: UsuariosService,
    private _viajesService: ViajesService
  ) {
    this.ready = false;
    this.filtering = false;
    this.errorMessage = '';
    this.userLogged = this._usuariosService.user;

    //Inicializa un objeto con fecha de inicio de un mes atrás
    //(resta 720 hrs a la fecha actual) y fecha actual como final
    this.objQuery = {
      fechaIni: this._usuariosService.calcularFechaMaxima(new Date(), -720),
      fechaFin: new Date(),
      cant: 1000,
      offset: 0,
    };

    //Array utilizado por el dateTimePicker para el rango de fechas
    this.desdeHasta = [this.objQuery.fechaIni, this.objQuery.fechaFin];
    this.rangoValido = false;

    console.log('objQuery:', this.objQuery);
  }

  ngOnInit(): void {
    this.getListas(this._viajesService.isIniciado);    
  }

  //Métodos accessores
  //*******************
  get isOpen(): boolean {
    return this.userLogged.open;
  }

  get getAlias(): string {
    return this.userLogged.alias;
  }

  // get getFechaIni() {
  //   return this.fechasViajes.get('fechaIni');
  // }

  // get getFechaFin() {
  //   return this.fechasViajes.get('fechaFin');
  // }

  // get getCant() {
  //   return this.fechasViajes.get('cant');
  // }

  // get getOffset() {
  //   return this.fechasViajes.get('offset');
  // }

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

    this.optFiltro = {
      chofer: "",
      estados: this.estadosViaje.map((est) => {return {id: est['estado_viaje_id'], chk: true} })
    };
    
    this.loading = false;
    this.ready = true;
    this._usuariosService.mostrarSpinner(this.loading, 'viaje_historico');
  }
  
  //Recibe el elemento dateTimePicker desde el evento dateTimeChange
  cambioFecha(rangoFechas: any) {
    //Si las dos fechas elegidas son válidas, se actualiza "objQuery"
    if (rangoFechas.value[0] && rangoFechas.value[1]) {
      console.log('Bien ahi', this.desdeHasta);
      this.objQuery['fechaIni'] = rangoFechas.value[0];
      this.objQuery['fechaFin'] = rangoFechas.value[1];
      this.rangoValido = true;
    } else {
      console.log('Nope');
      console.log('fechas', rangoFechas.value);
      console.log(this.objQuery);
      this.rangoValido = false;
    }    
  }
  
  //Llama la función tomando las fechas actualizadas de "objQuery"
  async actualizarRango() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'historico_detalle');

    await this.getViajesEntreFechas('desdeForm');
    
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

  // Manejo de filtrado
  //**********************

  mostrarFiltros() {
    this.filtering = !this.filtering;
  }  
  
}
