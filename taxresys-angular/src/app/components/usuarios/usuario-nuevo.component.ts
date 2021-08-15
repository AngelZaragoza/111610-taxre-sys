import { Component, ViewChild, ElementRef } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { confirmaPassword } from '../../classes/custom.validator';
import { DTODetalleUsuario } from '../../classes/detalle-usuario';
import { Persona } from '../../classes/persona';
import { Usuario } from '../../classes/usuario';
import { Router } from '@angular/router';
import { AlertasService } from 'src/app/services/alertas.service';
import { HttpErrorResponse } from '@angular/common/http';

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
    //Recupera roles de usuario para llenar combo
    this.roles = this._usuariosService.roles;

    //Controles del formulario
    this.newUsuario = new FormGroup(
      {
        rol_id: new FormControl('', Validators.required),
        alias: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
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
      { validators: confirmaPassword }
    );

    //Listo para guardar nuevo usuario: false
    this.ready = false;
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
  listenNuevo(persona) {
    //Recibe el objeto "persona" desde el evento del componente hijo
    this.persona = persona;

    //Listo para guardar nuevo usuario: true
    this.ready = true;
    // console.log('Nueva Persona =>');
    // console.table(this.persona);

    //Mueve el carrusel al siguiente Form
    this.nextSlide.nativeElement.dispatchEvent(
      new Event('click', { bubbles: true })
    );
  }

  confirmaGuardado() {
    //Recibe el objeto con los datos de "usuario" del form
    this.usuario = { ...this.newUsuario.value };
    // console.table(this.usuario);

    let mensaje = `¿Crear el Nuevo Usuario: ${this.usuario.alias} ?`;
    this._alertas.confirmDialog
      .fire({
        title: 'Guardar Datos',
        text: mensaje,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
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
    let result: any;

    //Crea un objeto "detalle" uniendo "persona" y "usuario"
    this.detalle = { ...this.persona, ...this.usuario };
    console.log('Resultado final =>');
    console.table(this.detalle);

    try {
      //Envia el objeto "detalle" al servicio para guardar en la DB
      result = await this._usuariosService.nuevoUsuarioFull(this.detalle);
    } catch (error) {
      result = error;
    }

    if (result instanceof HttpErrorResponse) {
      mensaje = `${result['error']['message']} -- ${result['statusText']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: 'Algo falló',
        text: mensaje,
      });
    } else {
      mensaje = `Nuevo Usuario: ${result['user']['alias']}`;
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Usuario Creado!',
        text: mensaje,
        didOpen: () => {
          this.ready = true;
          this.route.navigateByUrl('/usuarios');
        },
      });
    }

    // //Pide confirmación para el guardado (a mejorar aspecto...)
    // if (confirm(`Guardar nuevo Usuario: ${this.usuario.alias} ?`)) {
    //   //Crea un objeto "detalle" uniendo "persona" y "usuario"
    //   this.detalle = { ...this.persona, ...this.usuario };
    //   console.log('Resultado final =>');
    //   console.table(this.detalle);

    //Envia el objeto "detalle" al servicio para guardar en la DB
    // result = await this._usuariosService.nuevoUsuarioFull(this.detalle);
    // if (result['success']) {
    //   alert(`Usuario agregado: ${result['user']['alias']} !`);
    //   this.route.navigateByUrl('/home');
    // } else {
    //   alert(`Algo falló`);
    // }

    this.loading = false;
  }
}
