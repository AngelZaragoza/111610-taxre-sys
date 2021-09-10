import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-usuario-lista',
  templateUrl: './usuario-lista.component.html',
  styles: [],
})
export class UsuarioListaComponent implements OnInit, OnDestroy {
  //Listados
  lista: any[] = [];
  roles: any[] = [];

  //Información del usuario y turno
  userLogged: any = {};

  //Auxiliares
  personaSub: Subscription;
  loading: boolean;
  errorMessage: string;
  nombreComponente: string;

  constructor(private _usuariosService: UsuariosService) {
    this.errorMessage = '';
    this.nombreComponente = 'usr_lista';
  }

  ngOnInit(): void {
    this.userLogged = this._usuariosService.user;
    this.roles = this._usuariosService.roles;
    //Controlar usuario que realiza solicitud

    this.getUsuarios();
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

  get isAdmin(): boolean {
    return this.userLogged.rol_id == 1;
  }

  get isManager(): boolean {
    return this.userLogged.rol_id == 2;
  }

  //Métodos del componente
  //*******************
  async getUsuarios() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);
    this.lista = await this._usuariosService.getUsuarios();

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
          break;
      }
    });
  }

  ngOnDestroy(): void {
    //Destruye la suscripción
    this.personaSub.unsubscribe();
  }
}
