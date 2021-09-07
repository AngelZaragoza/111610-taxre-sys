import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChoferesService } from 'src/app/services/choferes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { AdherentesService } from 'src/app/services/adherentes.service';

@Component({
  selector: 'app-chofer-lista',
  templateUrl: './chofer-lista.component.html',
  styles: [],
})
export class ChoferListaComponent implements OnInit, OnDestroy {
  //Listado
  lista: any[] = [];

  //Información del usuario y turno
  userLogged: any = {};

  //Auxiliares
  loading: boolean;
  errorMessage: string = '';
  listaSub: Subscription;

  constructor(
    private _choferesService: ChoferesService,
    private _adherentesService: AdherentesService,
    private _usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
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
    this._usuariosService.mostrarSpinner(this.loading, 'chofer_lista');
    this.lista = await this._choferesService.getChoferes();
    if (this.lista[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.lista[0]['error']['message'];
    }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'chofer_lista');

    this.listenUpdates();
  }

  listenUpdates(): void {
    //Se suscribe a los cambios en la lista de Choferes
    this.listaSub = this._choferesService.choferesObs$.subscribe((lista) => {
      if (lista[0] instanceof HttpErrorResponse) {
        this.errorMessage = lista[0]['error']['message'];
      }  else {
        this.errorMessage = '';
      }
      this.lista = lista;
    })
  }

  ngOnDestroy(): void {
    //Destruye la suscripción
    this.listaSub.unsubscribe();
  }  
}
