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
  minChar = 5;
  result: any = {};

  constructor(
    private _usuariosService: UsuariosService,
    private route: Router
  ) {
    this.forma = new FormGroup({
      usuario: new FormControl('', [
        Validators.required,
        Validators.minLength(this.minChar),
      ]),
      pass: new FormControl('', [
        Validators.required,
        Validators.minLength(this.minChar),
      ]),
    });
  }

  ngOnInit(): void {}

  logForma() {
    console.log(this.forma.controls);
  }

  async logIn() {
    
    this.result = await this._usuariosService.passportLogin(this.forma.value);
    
    if( this.result['error'] ) console.log(this.result['error']);   
    
    console.log(this._usuariosService.user);

    if (this._usuariosService.user.logged) {
      this.route.navigateByUrl('/home');
    }

    //Agregar lógica de respuesta en caso de falla de login
  }
}
