import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdherentesService } from 'src/app/services/adherentes.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-adherente-lista',
  templateUrl: './adherente-lista.component.html',
  styles: [],
})
export class AdherenteListaComponent implements OnInit, OnDestroy {
  //Listado
  lista: any[] = [];

  //Información del usuario y turno
  userLogged: any = {};

  //Auxiliares
  personaSub: Subscription;
  loading: boolean;
  errorMessage: string;
  nombreComponente: string;

  constructor(
    private _adherentesService: AdherentesService,
    private _usuariosService: UsuariosService,
    private _utils: UtilsService
  ) {
    this.errorMessage = '';
    this.nombreComponente = 'adh_lista';
  }

  ngOnInit(): void {
    this.userLogged = this._usuariosService.user;
    //Controlar usuario que realiza solicitud
    this.getAdherentes();
  }

  //Métodos accessores
  //*******************
  get isAdmin(): boolean {
    return this.userLogged.rol_id == 1;
  }

  get isManager(): boolean {
    return this.userLogged.rol_id == 2;
  }

  //Métodos del componente
  //*******************
  async getAdherentes() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);
    this.lista = await this._adherentesService.getAdherentes();

    if (this.lista instanceof HttpErrorResponse) {
      this.errorMessage = this.lista.error['message'];
    } else {
      this.errorMessage = '';
    }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);

    this.listenUpdates();
  }

  listenUpdates(): void {
    //Se suscribe a los cambios en cualquier elemento de la lista
    this.personaSub = this._usuariosService.personaObs$.subscribe((data) => {
      let { action, ...valores } = data;

      // Se chequea la propiedad 'action' del Observable
      switch (action) {
        case 'added':
          this.lista.push(valores['created']);
          this._utils.ordenarListado(this.lista,'apellido');
          break;
        case 'updated':
          let index = this.lista.findIndex(
            (item) => item['persona_id'] == valores['persona_id']
          );
          for (const key in this.lista[index]) {
            if (Object.prototype.hasOwnProperty.call(valores, key)) {
              this.lista[index][key] = valores[key];
            }
          }
          // this.lista = this._listadoService.ordenarListado(this.lista,'apellido', 'asc');
          this._utils.ordenarListado(this.lista,'apellido');
          break;
      }
    });
  }
  
  ngOnDestroy(): void {
    //Destruye la suscripción y emite la lista actualizada
    this.personaSub.unsubscribe();
    this._adherentesService.adherentesObs$.next(this.lista);
  }
}
