import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from '../../classes/custom.validator';
import { HttpErrorResponse } from '@angular/common/http';

import { DTODetalleUsuario } from '../../classes/detalle-usuario';
import { Persona } from '../../classes/persona';
import { Usuario } from '../../classes/usuario';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { AlertasService } from 'src/app/services/alertas.service';

@Component({
  selector: 'app-usuario-nuevo',
  templateUrl: './usuario-nuevo.component.html',
  styles: [],
})
export class UsuarioNuevoComponent {
  //Crea una referencia al button nextSlide del form
  @ViewChild('nextSlide', { read: ElementRef }) nextSlide: ElementRef;

  //Formulario y objeto de roles de usuario
  newUsuario: FormGroup;
  roles: any;

  //Clases modelo para los objetos
  detalle: DTODetalleUsuario = new DTODetalleUsuario();
  persona: Persona = new Persona();
  usuario: Usuario = new Usuario();

  //Listo para guardar nuevo Usuario
  ready: boolean;
  loading: boolean;

  constructor(
    private _usuariosService: UsuariosService,
    private _alertas: AlertasService,
    private route: Router
  ) {
    // Recupera roles de usuario para llenar combo
    this.roles = this._usuariosService.roles;

    this.initForm();

    // Listo para guardar nuevo usuario: false
    this.ready = false;
  }

  /**
   * Inicializa los controles del Form
   */
  initForm() {
    this.newUsuario = new FormGroup(
      {
        rol_id: new FormControl('', Validators.required),
        alias: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
          Validators.pattern(CustomValidators.ALFANUM_NO_ESPACIOS), //Sólo alfanumérico (ñ ni acentos permitidos)
        ]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(35),
        ]),
        passwordConfirm: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(35),
        ]),
      },      
      { validators: CustomValidators.confirmaPassword }
    );
  }  

  /**
   * Resetea el Form y lo rellena con los datos del Usuario
   */  
  resetForm() {
    this.newUsuario.reset();
    this.initForm();   
  }

  //Accesores del Form
  //********************
  get rolUser() {
    return this.newUsuario.get('rol_id');
  }

  get userName() {
    return this.newUsuario.get('alias');
  }

  get pass() {
    return this.newUsuario.get('password');
  }

  get passConfirm() {
    return this.newUsuario.get('passwordConfirm');
  }

  //Métodos del componente
  //********************
  listenNuevo(persona: Persona): void {
    //Recibe el objeto "persona" desde el evento del componente hijo
    this.persona = persona;

    //Listo para guardar nuevo usuario: true
    this.ready = true;

    //Mueve el carrusel al siguiente Form
    this.nextSlide.nativeElement.dispatchEvent(
      new Event('click', { bubbles: true })
    );
  }

  confirmaGuardado(): void {
    //Recibe el objeto con los datos de "usuario" del form
    this.usuario = { ...this.newUsuario.value };

    let mensaje = `¿Crear el Nuevo Usuario: ${this.usuario.alias} ?`;
    this._alertas.confirmDialog
      .fire({
        title: 'Guardar Datos',
        text: mensaje,
        icon: 'question',
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se llama el método que guarda en la DB
          this.saveUsuario();
        }
      });
  }

  async saveUsuario() {
    this.loading = true;
    let mensaje: string;

    //Crea un objeto "detalle" uniendo "persona" y "usuario"
    this.detalle = { ...this.persona, ...this.usuario };

    //Envia el objeto "detalle" al servicio para guardar en la DB
    let result = await this._usuariosService.nuevoUsuarioFull(this.detalle);

    if (result instanceof HttpErrorResponse) {
      mensaje = `${result.error['message']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: `Algo falló (${result.error['status']})`,
        text: mensaje,
      });
    } else {
      mensaje = `Nuevo Usuario Creado. Espere...`;
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Usuario Guardado!',
        text: mensaje,
        didOpen: () => {
          this.ready = true;
          this.route.navigateByUrl('/usuarios');
        },
      });
    }

    this.loading = false;
  }
}
