import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../../services/usuarios.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [
  ]
})
export class LoginComponent implements OnInit {

  user = {
    usuario: 'AngelZ',
    pass: 'Watito39',
  };

  constructor( private _usuariosService:UsuariosService ) { }

  ngOnInit(): void {
  }

  logIn() {
    this._usuariosService.passportLogin(this.user);
  }

}
