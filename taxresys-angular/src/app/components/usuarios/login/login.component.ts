import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertasService } from 'src/app/services/alertas.service';
import { UsuariosService } from '../../../services/usuarios.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  datosLogin: FormGroup;
  minChar = 5;
  loading: boolean;
  desactivar: boolean;

  constructor(
    private _usuariosService: UsuariosService,
    private _alertas: AlertasService,
    private route: Router
  ) {
    //Controla el estado de los controles del formulario
    this.desactivar = false;

    //Instanciar controles del formulario con validadores
    this.datosLogin = new FormGroup({
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

  //Accesores del Form
  //*******************
  get usuario() {
    return this.datosLogin.get('usuario');
  }

  get pass() {
    return this.datosLogin.get('pass');
  }

  //Métodos del componente
  //**********************
  async logIn() {
    try {
      this.loading = true;
      let result = await this._usuariosService.passportLogin(
        this.datosLogin.value
      );
      console.log('User en service =>', this._usuariosService.user);

      //Desactivar controles del formulario y mostrar un toast según el resultado
      this.desactivar = true;
      this._alertas.successDialog.fire({
        title: 'Logueo exitoso !! Espere...',
        position: 'top',
        toast: true,
        didDestroy: () => {
          //Redirigir al home luego del login exitoso
          this.route.navigateByUrl('/home');
        },
      });
    } catch (error) {
      console.error('Login Error =>', error);
      this._alertas.problemDialog.fire({
        title: error['error'].message,
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
    } finally {
      this.loading = false;
    }
  }
}
