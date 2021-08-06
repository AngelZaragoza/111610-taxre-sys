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
  listaFiltrada: Viaje[] = [];

  //Información del usuario y turno
  userLogged: any = {};

  //Objetos para consultas
  objQuery: any = {};
  desdeHasta: any = [];
  objFiltro: any = {};

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

    //Se inicializa el objeto que se usará para el filtrado
    this.restaurarFiltros(false);

    this.loading = false;
    this.ready = true;
    this._usuariosService.mostrarSpinner(this.loading, 'viaje_historico');
  }

  //Recibe el elemento dateTimePicker desde el evento dateTimeChange
  cambioFecha(rangoFechas: any) {
    //Si las dos fechas elegidas son válidas, se actualiza "objQuery"
    if (rangoFechas.value[0] && rangoFechas.value[1]) {
      this.objQuery['fechaIni'] = rangoFechas.value[0];
      this.objQuery['fechaFin'] = rangoFechas.value[1];
      this.rangoValido = true;
    } else {
      console.log('Rango inválido', rangoFechas.value);
      console.log(this.objQuery);
      this.rangoValido = false;
    }
  }

  //Llama la función tomando las fechas actualizadas de "objQuery"
  async actualizarRango() {
    this.loading = true;
    
    //Si se llama desde el Form, muestra el spinner de carga que oculta solo la tabla
    this._usuariosService.mostrarSpinner(this.loading, 'historico_detalle');
    await this.getViajesEntreFechas('desdeForm');
  }

  async getViajesEntreFechas(origenRequest: string) {
    //Vaciar el mensaje de error, sino no se muestra la lista aunque se encuentren registros
    this.errorMessage = '';
    
    this.listaViajesFechas = await this._viajesService.getViajesEntreFechas(
      this.objQuery
    );

    //Si no hay viajes cargados, se recupera el mensaje de error
    if (this.listaViajesFechas[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.listaViajesFechas[0]['error']['message'];
    }
    else {
      //Se asigna el resultado de la consulta a otro array, sobre el cual se aplican los filtros
      //De esta manera solo se consulta la DB cuando cambia el rango de fechas
      this.listaFiltrada = this.listaViajesFechas;
    }

    //Si se llama desde el Form, se oculta el spinner de carga que oculta solo la tabla
    if (origenRequest == 'desdeForm') {
      this.loading = false;
      this._usuariosService.mostrarSpinner(this.loading, 'historico_detalle');
    }
  }

  // Manejo de filtrado
  //**********************

  restaurarFiltros(desdeForm: boolean) {
    //Estado inicial del objeto que se usará para el filtrado
    this.objFiltro = {
      chofer: '',
      estados: this.estadosViaje.map((item) => {
        return { id: item['estado_viaje_id'], chk: true };
      }),
      tipos: this.tiposViaje.map((item) => {
        return { id: item['tipo_viaje_id'], chk: true };
      }),
    };
    
    //Si se llamó desdel el Form, se restauran los registros filtrados
    if(desdeForm) {
      this.listaFiltrada = this.listaViajesFechas;
    }

  }

  mostrarFiltros() {
    //Para mostrar u ocultar los controles de filtrado
    this.filtering = !this.filtering;
  }

  aplicarFiltros() {
    //Vaciar el mensaje de error, sino no se muestra la lista aunque se encuentren registros
    this.errorMessage = '';
    
    let porChofer = [];
    porChofer = this.listaViajesFechas.filter(
      (viaje) =>
        this.objFiltro.chofer == '' || viaje.chofer_id == this.objFiltro.chofer
    );

    console.log('por chofer', porChofer, 'registros', porChofer.length);
    this.listaFiltrada = porChofer;
    
    //Si el filtro por Choferes no encuentra resultados, se impide la ejecución de los demás
    if (porChofer.length == 0) {
      this.errorMessage = 'No hay registros que cumplan los criterios';
      return;
    }

    //Crea un array con los id de los Tipos seleccionados con los checkboxes
    let tiposMarcados: [] = this.objFiltro.tipos
      .filter((est) => est.chk)
      .map((filt) => filt.id);

    console.log('Tipos marcados', tiposMarcados);

    //Filtra el array porChofer usando el array de Tipos seleccionados
      let porTipo = porChofer.filter((viaje) =>
      tiposMarcados.some((id) => viaje.tipo_viaje_id == id)
    );
    
    //Si el filtro por Tipos no encuentra resultados, se impide la ejecución de los demás
    if (porTipo.length == 0) {
      this.errorMessage = 'No hay registros que cumplan los criterios';
      return;
    }
    
    let estadosMarcados: [] = this.objFiltro.estados
      .filter((est) => est.chk)
      .map((filt) => filt.id);

    console.log('Estados marcados', estadosMarcados);

    //Filtra el array porTipo usando el array de Tipos seleccionados
    let porEstados = porTipo.filter((viaje) =>
      estadosMarcados.some((id) => viaje.estado_viaje_id == id)
    );

    this.listaFiltrada = porEstados;

    //Si al final de todos los filtros no hay registros, se setea mensaje de error
    if (porEstados.length == 0) {
      this.errorMessage = 'No hay registros que cumplan los criterios';
    }
  }
}
