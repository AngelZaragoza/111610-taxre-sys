import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Viaje } from 'src/app/classes/viaje.model';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ViajesService } from 'src/app/services/viajes.service';

@Component({
  selector: 'app-viajes-planilla',
  templateUrl: './viaje-planilla.component.html',
  styles: [
    '.box-tabla { position: relative; height: 50vh; max-height: 50vh; overflow-y: scroll; }',
    '.cont-tabla { position: absolute; top: 0px; left: 0px; }',
  ],
})
export class ViajePlanillaComponent implements OnInit, OnDestroy {
  //Listados
  tiposViaje: any[] = [];
  estadosViaje: any[] = [];
  listaMovilesJornadas: any[] = [];
  listaChoferes: any[] = [];
  listaViajesTurno: Viaje[] = [];

  //Información del usuario y turno
  userLogged: any = {};
  userSub: Subscription;

  //Objeto modelo y auxiliares
  viaje: Viaje;
  errorMessage: string;
  loading: boolean;
  nuevo: boolean;
  tipo: number;
  estado: number;

  constructor(
    private _usuariosService: UsuariosService,
    private _viajesService: ViajesService
  ) {
    this.errorMessage = '';
    this.nuevo = false;
  }

  ngOnInit(): void {
    this.userSub = this._usuariosService.userObs$.subscribe((userLogged) => {
      console.log('viajesPlanilla', userLogged);
      this.userLogged = userLogged;
    });
    this._usuariosService.checkAuth(false);

    if (this.isOpen) {
      //Si hay un turno actualmente abierto, recupera las listas
      console.log('Turno en Viajes =>', this.getTurno);
      this.getListas(this._viajesService.isIniciado);
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Destruye el suscriptor
    console.log('|| Planillas Viaje Destruido ||');
    this.userSub.unsubscribe();
  }

  //Métodos accessores
  //*******************
  get isLogged(): boolean {
    return this.userLogged.logged;
  }

  get isOpen(): boolean {
    return this.userLogged.open;
  }

  get getTurno(): number {
    return this.userLogged.turno_id;
  }

  get getAlias(): string {
    return this.userLogged.alias;
  }

  //Métodos del componente
  //**********************
  async getListas(isIniciado: boolean) {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'viaje_planilla');

    //Se recuperan las listas con los datos para los Viajes
    if (!isIniciado) {
      await this._viajesService.cargarListas();
    }
    this.tiposViaje = this._viajesService.tiposViaje;
    this.estadosViaje = this._viajesService.estadosViaje;
    this.listaChoferes = this._viajesService.listaChoferes;
    
    this.listaMovilesJornadas = await (
      await this._viajesService.getLista('/jornadas')
    ).filter(
      (movil) => movil.turno_cierre === null && movil.turno_inicio !== null
    );

    //Se muestran las listas recuperadas. Solo para debug
    console.table(this.listaMovilesJornadas);

    //Si no hay jornadas abiertas, se recupera el mensaje de error
    if (this.listaMovilesJornadas[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.listaMovilesJornadas[0]['error']['message'];
    }

    //Se recuperan los viajes cargados en el turno Activo
    await this.getViajesTurnoActivo();

    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'viaje_planilla');
  }

  async getViajesTurnoActivo() {
    this.listaViajesTurno = await this._viajesService.getViajesTurnoActivo(
      this.getTurno
    );

    //Si no hay viajes cargados, se recupera el mensaje de error
    if (this.listaViajesTurno[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.listaViajesTurno[0]['error']['message'];
    }
  }

  //Se setean valores para enviar al Form
  //-------------------------------------
  nuevoViaje() {
    this.tipo = 1;
    this.estado = 1;
    this.nuevo = true;
  }

  nuevoPendiente() {
    this.tipo = 2;
    this.estado = 4;
    this.nuevo = true;
  }

  nuevoPedido() {
    this.tipo = 3;
    this.estado = 1;
    this.nuevo = true;
  }

  //Reciben eventos desde el componente hijo
  //-------------------------------------
  mostrarForm(event: boolean) {
    this.nuevo = event;
  }

  async viajeAgregado(event: Viaje) {
    //Si el viaje que llega desde el hijo no es tipo Pendiente,
    //se lo agrega al arreglo de Viajes registrados del Turno
    if (event.estado_viaje_id != 4) {
      this.listaViajesTurno.push(event);
    }
    this.mostrarForm(false);
  }
}
