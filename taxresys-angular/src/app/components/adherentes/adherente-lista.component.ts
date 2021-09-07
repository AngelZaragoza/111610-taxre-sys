import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdherentesService } from 'src/app/services/adherentes.service';
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
  listaSub: Subscription;
  loading: boolean;
  errorMessage: string;
  nombreComponente: string;

  constructor(
    private _adherentesService: AdherentesService,
    private _usuariosService: UsuariosService
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
    //Se suscribe a los cambios en la lista de Adherentes
    this.listaSub = this._adherentesService.adherentesObs$.subscribe((lista) => {      
      this.lista = lista;
    })
  }

  ngOnDestroy(): void {
    //Destruye la suscripción
    this.listaSub.unsubscribe();
  }
}
