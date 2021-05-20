import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UsuariosService } from '../../../services/usuarios.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  forma: FormGroup;

  user = {};

  constructor(private _usuariosService: UsuariosService, private route: Router) {
    this.forma = new FormGroup({
      usuario: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
      ]),
      pass: new FormControl('', [Validators.required, Validators.minLength(5)]),
    });
  }

  ngOnInit(): void {}

  async logIn() {    
    await this._usuariosService.passportLogin(this.forma.value);
    console.log(this._usuariosService.user);
    
    if(!this._usuariosService.user['status']) {
      // this.route.navigate['home'];
      this.route.navigateByUrl('/home');
    }
  }
}
