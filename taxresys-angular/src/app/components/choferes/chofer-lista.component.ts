import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChoferesService } from 'src/app/services/choferes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ListadoService } from 'src/app/services/listado.service';

@Component({
  selector: 'app-chofer-lista',
  templateUrl: './chofer-lista.component.html',
  styles: [],
})
export class ChoferListaComponent implements OnInit, OnDestroy {
  //Listado
  lista: any[] = [];

  //Información del usuario y turno
  // userLogged: any = {};

  //Auxiliares
  personaSub: Subscription;
  loading: boolean;
  errorMessage: string;
  nombreComponente: string;
  ultimoOrden: string;

  constructor(
    private _choferesService: ChoferesService,
    private _usuariosService: UsuariosService,
    private _listadoService: ListadoService
  ) {
    this.errorMessage = '';
    this.nombreComponente = 'chf_lista';
    this.ultimoOrden = '';
  }

  ngOnInit(): void {
    // this.userLogged = this._usuariosService.user;
    //Controlar usuario que realiza solicitud
    this.getChoferes();
  }

  //Métodos accessores
  //*******************
  get isAdmin(): boolean {
    return this._usuariosService.user['rol_id'] === 1;
  }

  get isManager(): boolean {
    return this._usuariosService.user['rol_id'] === 2;
  }

  //Métodos del componente
  //*******************
  async getChoferes() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);
    this.lista = await this._choferesService.getChoferes();

    if (this.lista instanceof HttpErrorResponse) {
      this.errorMessage = this.lista.error['message'];
    } else {
      this.errorMessage = '';
      this.listenUpdates();
    }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);
  }

  ordenarPor(campo: string): void {
    let orden: string;
    if (this.ultimoOrden === campo) {
      orden = 'desc';
      this.ultimoOrden = '';
    } else {
      orden = 'asc';
      this.ultimoOrden = campo;
    }
    this._listadoService.ordenarListado(this.lista, campo, orden);
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
      this.ordenarPor('apellido');
    });
  }

  ngOnDestroy(): void {
    //Destruye la suscripción y emite la lista actualizada
    this.personaSub.unsubscribe();
    this.ultimoOrden = '';
    this.ordenarPor('apellido');
    this._choferesService.choferesObs$.next(this.lista);
  }
}
