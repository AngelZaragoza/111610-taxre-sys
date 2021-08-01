import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';

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
  desactivar: boolean;

  constructor(
    private _usuariosService: UsuariosService,
    private route: Router
  ) {
    //Controlar el estado de los controles del formulario
    this.desactivar = false;

    //Instanciar controles del formulario con validadores
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

  async logIn() {
    this.loading = true;
    this.result = await this._usuariosService.passportLogin(this.forma.value);

    //Desactivar controles del formulario y mostrar un toast según el resultado
    this.desactivar = true;

    if (this.result['error']) {
      console.log('Login Error =>', this.result['error']);

      Swal.fire({
        title: this.result['error'].message,
        icon: 'error',
        position: 'top',        
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        didOpen: () => {
          //Activar controles si el login falló 
          this.desactivar = false;
        },
      });
    } else {
      console.log('User en service =>', this._usuariosService.user);

      Swal.fire({
        title: 'Logueo exitoso !! Espere...',
        icon: 'success',
        position: 'top',
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        didDestroy: (toast) => {
          //Redirigir al home si el login fue exitoso
          this.route.navigateByUrl('/home');
        },
      });
    }

    this.loading = false;
  }
}
