import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-usuario-lista',
  templateUrl: './usuario-lista.component.html',
  styles: []
})
export class UsuarioListaComponent implements OnInit {

  lista: any[] = [];
  loading: boolean;

  constructor( private _usuariosService: UsuariosService ) { }

  ngOnInit(): void {
    
    //Controlar usuario que realiza solicitud    
    this.getUsuarios();
  }

  async getUsuarios() {
    
    //Implementar ngIf de Cargando...
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'usuario_lista');
    this.lista = await this._usuariosService.getUsuarios();
    if (this.lista instanceof HttpErrorResponse) {
      this._handleError(this.lista);
    }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'usuario_lista');
  }

  _handleError(error:Error) {
    if(error['status'] === 401) 
      console.log('Error auth', error.message);
    if(error['status'] === 404)
      console.log('Error not found', error.message);
      
    
  }
}
