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
  edicion = false;  
  constructor( private _usuariosService: UsuariosService ) { }

  ngOnInit(): void {
    this.getUsuarios();
  }

  async getUsuarios() {
    this.lista = await this._usuariosService.getUsuarios();
  }

}
