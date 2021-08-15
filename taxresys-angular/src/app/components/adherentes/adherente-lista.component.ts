import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AdherentesService } from 'src/app/services/adherentes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-adherente-lista',
  templateUrl: './adherente-lista.component.html',
  styles: [],
})
export class AdherenteListaComponent implements OnInit {
  //Listado
  lista: any[] = [];

  //Información del usuario y turno
  userLogged: any = {};

  //Auxiliares
  errorMessage: string = '';
  loading: boolean;

  constructor(
    private _adherentesService: AdherentesService,
    private _usuariosService: UsuariosService
  ) {}

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
    this._usuariosService.mostrarSpinner(this.loading, 'adh_lista');
    this.lista = await this._adherentesService.getAdherentes();
    if (this.lista[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.lista[0]['error']['message'];
    } else {
      this.errorMessage = '';
    }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'adh_lista');
  }
  
  cerradoForm(event: any): void {
    //Se ejecuta cuando un componente en una ruta hija se destruye
    if (event['changes']) {
      //Si la propiedad ready desde el event es true, se actualiza la lista
      this.getAdherentes();
    }
    // this.formAbierto = false;
  }
}
