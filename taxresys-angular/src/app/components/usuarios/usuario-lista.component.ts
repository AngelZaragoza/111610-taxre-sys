import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-usuario-lista',
  templateUrl: './usuario-lista.component.html',
  styles: []
})
export class UsuarioListaComponent implements OnInit {
  //Listados
  lista: any[] = [];
  
  //Información del usuario y turno
  userLogged: any = {};
  userSub: Subscription;
  
  //Auxiliares
  errorMessage: string;
  loading: boolean;
  
  constructor( private _usuariosService: UsuariosService ) { 
    this.errorMessage = '';
  }

  ngOnInit(): void {
    this.userSub = this._usuariosService.userObs$.subscribe((userLogged) => {
      // console.log('viajesPlanilla', userLogged);
      this.userLogged = userLogged;
    });
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

  async getUsuarios() {
    
    //Implementar ngIf de Cargando...
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'usuario_lista');
    this.lista = await this._usuariosService.getUsuarios();
    if (this.lista[0] instanceof HttpErrorResponse) {
      this._handleError(this.lista[0]);
      this.errorMessage = this.lista['error']['message'];
    }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'usuario_lista');
  }

  cerradoForm(event: any): void {
    console.log('Outlet desactivado', event);
    if(event['ready']) {
      //Si la propiedad ready desde el event es true, se actualiza la lista
      this.getUsuarios();
    }
    // this.formAbierto = false;
  }


  _handleError(error:Error) {
    if(error['status'] === 401) 
      console.log('Error auth', error.message);
    if(error['status'] === 404)
      console.log('Error not found', error.message);
      
    
  }
}
