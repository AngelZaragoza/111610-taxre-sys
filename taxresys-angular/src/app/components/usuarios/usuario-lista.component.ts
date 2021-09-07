import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
  
  //Auxiliares
  loading: boolean;
  errorMessage: string;
  nombreComponente: string;
  
  constructor( private _usuariosService: UsuariosService ) { 
    this.errorMessage = '';
    this.nombreComponente = 'usr_lista';
  }

  ngOnInit(): void {
    this.userLogged = this._usuariosService.user;
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
  }
}
