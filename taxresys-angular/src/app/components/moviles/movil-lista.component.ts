import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MovilesService } from 'src/app/services/moviles.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-movil-lista',
  templateUrl: './movil-lista.component.html',
  styles: [],
})
export class MovilListaComponent implements OnInit, OnDestroy {
  //Listado
  lista: any[] = [];

  //Información del usuario y turno
  userLogged: any = {};

  //Auxiliares
  errorMessage: string = '';
  loading: boolean;
  listaSub: Subscription;

  constructor(
    private _movilesService: MovilesService,
    private _usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.userLogged = this._usuariosService.user;
    //Controlar usuario que realiza solicitud
    this.getMoviles();
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
  async getMoviles() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'movil_lista');
    this.lista = await this._movilesService.getLista('/moviles');
    if (this.lista[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.lista[0]['error']['message'];
    }  else {
      this.errorMessage = '';
    }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'movil_lista');
    
    this.listenUpdates();
  }
  
  listenUpdates(): void {
    //Se suscribe a los cambios en la lista de Móviles
    this.listaSub = this._movilesService.movilesObs$.subscribe((lista) => {
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
