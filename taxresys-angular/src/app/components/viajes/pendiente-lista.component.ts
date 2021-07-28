import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Viaje } from 'src/app/classes/viaje.model';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ViajesService } from 'src/app/services/viajes.service';

@Component({
  selector: 'app-pendiente-lista',
  templateUrl: './pendiente-lista.component.html',
  styles: [],
})
export class PendienteListaComponent implements OnInit {
  //Listados
  tiposViaje: any[] = [];
  estadosViaje: any[] = [];
  listaMovilesJornadas: any[] = [];
  listaChoferes: any[] = [];
  listaPendientesActivos: any[] = [];

  //Información del usuario y turno
  userLogged: any = {};
  userSub: Subscription;

  //Objeto modelo y auxiliares
  viaje: Viaje;
  asignaPendiente: any;
  errorMessage: string;
  loading: boolean;
  editar: boolean;
  tipo: number;
  estado: number;

  constructor(
    private _usuariosService: UsuariosService,
    private _viajesService: ViajesService
  ) {
    this.errorMessage = '';
    this.editar = false;
  }

  ngOnInit(): void {
    this.userSub = this._usuariosService.userObs$.subscribe((userLogged) => {
      console.log('pendientesLista', userLogged);
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
    console.log('|| Lista Pendientes Destruido ||');
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

  //Métodos del componente
  //**********************
  async getListas(isIniciado: boolean) {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'pendiente_lista');

    //Se recuperan las listas con los datos para los Viajes
    if (!isIniciado) {
      await this._viajesService.cargarListas();
    }
    this.tiposViaje = this._viajesService.tiposViaje;
    this.estadosViaje = this._viajesService.estadosViaje;
    this.listaChoferes = this._viajesService.listaChoferes;
    
    // this.tiposViaje = await this._viajesService.getLista('/viajes/tipos');
    // this.estadosViaje = await this._viajesService.getLista('/viajes/estados');
    // this.listaChoferes = await this._viajesService.getLista('/choferes');
    this.listaMovilesJornadas = await (
      await this._viajesService.getLista('/jornadas')
    ).filter(
      (item) => item.turno_cierre === null && item.turno_inicio !== null
    );

    //Se muestran las listas recuperadas. Solo para debug
    console.table(this.listaMovilesJornadas);

    //Si no hay jornadas abiertas, se recupera el mensaje de error
    if (this.listaMovilesJornadas[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.listaMovilesJornadas[0]['error']['message'];
    }

    //Se recuperan los viajes Pendientes de asignar
    // await this.getPendientesActivos();
    this.listaPendientesActivos = this._viajesService.listaPendientesActivos;

    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'pendiente_lista');
  }

  asignarPendiente(viaje:any) {
    this.asignaPendiente = viaje;
    this.tipo = 2;
    this.estado = 1;
    this.mostrarForm(true);
  }

  //Reciben eventos desde el componente hijo
  //-------------------------------------
  mostrarForm(event: boolean) {
    this.editar = event;
  }

  async pendienteAsignado(event: Viaje) {
    
    //Recarga la lista de Viajes Pendientes
    //y oculta el Form de Viaje
    await this.getPendientesActivos();
    this.mostrarForm(false);
  }

  async getPendientesActivos() {
    this.listaPendientesActivos = await this._viajesService.getPendientesActivos();

    //Si no hay pendientes activos, se recupera el mensaje de error
    if (this.listaPendientesActivos[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.listaPendientesActivos[0]['error']['message'];
    }
  }
}
