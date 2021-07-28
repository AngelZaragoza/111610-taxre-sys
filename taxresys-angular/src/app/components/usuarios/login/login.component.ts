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
  loading: boolean;

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
    this.loading = true;
    this.result = await this._usuariosService.passportLogin(this.forma.value);

    if (this.result['error']) {
      console.log('Login Error =>', this.result['error']);
    } else {
      console.log('User en service =>', this._usuariosService.user);
      setTimeout(() => {
        this.route.navigateByUrl('/home');        
      }, 1500);
    }
    this.loading = false;
    //Agregar lógica de respuesta en caso de falla de login
  }
}
