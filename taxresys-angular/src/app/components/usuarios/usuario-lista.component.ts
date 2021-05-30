import { Component, OnInit } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-usuario-lista',
  templateUrl: './usuario-lista.component.html',
  styles: [
  ]
})
export class UsuarioListaComponent implements OnInit {

  lista: any[] = [];
  
  constructor( private _usuariosService: UsuariosService ) { }

  ngOnInit(): void {
    
    //Controlar usuario que realiza solicitud
    this.getUsuarios();
  }

  async getUsuarios() {
    this.lista = await this._usuariosService.getUsuarios();
  }

}
