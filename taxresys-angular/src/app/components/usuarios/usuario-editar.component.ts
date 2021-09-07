import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DTODetalleUsuario } from '../../classes/detalle-usuario';
import { Persona } from '../../classes/persona';
import { Usuario } from '../../classes/usuario';
import { confirmaPassword } from '../../classes/custom.validator';
import { AlertasService } from 'src/app/services/alertas.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-usuario-editar',
  templateUrl: './usuario-editar.component.html',
  styles: [],
})
export class UsuarioEditarComponent {
  //Crea una referencia a un elemento del DOM
  @ViewChild('toggleModal', { read: ElementRef }) llamaModal: ElementRef;

  //Clases modelo para los objetos
  detalle: DTODetalleUsuario = new DTODetalleUsuario();
  persona: Persona = new Persona();
  usuario: Usuario = new Usuario();

  //Formulario y objeto de roles de usuario
  editUsuario: FormGroup;
  roles: any;

  //Auxiliares
  idParam: any;
  editar: boolean;
  loading: boolean;
  ready: boolean;
  errorMessage: string = '';
  nombreComponente: string;

  constructor(
    private _usuariosService: UsuariosService,
    private activatedRoute: ActivatedRoute,
    private _alertas: AlertasService,
    private route: Router
  ) {
    this.nombreComponente = 'usr_detalle';
    this.roles = this._usuariosService.roles;

    //Inicializar los controles del Form
    this.initForm();

    //Se ejecuta con cada llamada a la ruta que renderiza este componente
    //excepto cuando el parámetro que viene con la ruta no cambia.
    //Setea "editar" en falso para evitar ediciones accidentales.
    this.activatedRoute.params.subscribe((params) => {
      this.idParam = params['usuario_id'];
      this.editar = false;
      this.ready = false;

      this.detalleUsuario(this.idParam).finally(() => {
        if (this.ready) {
          this.personaId.setValue(this.usuario.persona_id);
          this.userId.setValue(this.usuario.usuario_id);
          this.userName.setValue(this.usuario.alias);
          this.rolSelect.setValue(this.usuario.rol_id);
        } else {
          console.warn(this.errorMessage);
        }
      });
    });
  }

  initForm(): void {
    this.editUsuario = new FormGroup(
      {
        persona_id: new FormControl(0),
        usuario_id: new FormControl(0),
        rol_id: new FormControl(0),
        alias: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
        ]),
        passwordAnterior: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(35),
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
  }

  //Métodos accesores en general
  //****************************
  get isAdmin(): boolean {
    return this._usuariosService.user['rol_id'] === 1;
  }

  get isOwner(): boolean {
    return this._usuariosService.user['usuario_id'] == this.idParam;
  }

  get rolNombre(): string {
    let nombre = this._usuariosService.roles.find(
      (rol) => rol.rol_id === this.usuario.rol_id
    );
    return nombre['nombre'];
  }

  //Accesores del Form
  //*******************
  get personaId() {
    return this.editUsuario.get('persona_id');
  }

  get userId() {
    return this.editUsuario.get('usuario_id');
  }

  get rolSelect() {
    return this.editUsuario.get('rol_id');
  }

  get userName() {
    return this.editUsuario.get('alias');
  }

  get passAnterior() {
    return this.editUsuario.get('passwordAnterior');
  }

  get pass() {
    return this.editUsuario.get('password');
  }

  get passConfirm() {
    return this.editUsuario.get('passwordConfirm');
  }

  //Métodos del componente
  //**********************
  async detalleUsuario(id: number) {
    this.loading = true;    
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);

    this.detalle = await this._usuariosService.detalleUsuario(id);
    if (this.detalle instanceof HttpErrorResponse) {
      this.ready = false;
      this.errorMessage = this.detalle.error['message'];
    } else {
      for (let field in this.detalle) {
        //Toma los campos del detalle y los divide en sus respectivos objetos
        if (this.usuario[field] !== undefined)
          this.usuario[field] = this.detalle[field];
        if (this.persona[field] !== undefined)
          this.persona[field] = this.detalle[field];
      }
      this.ready = true;
      this.errorMessage = '';
    }

    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);
  }

  activarEdicion() {
    this.editar = !this.editar;
  }

  listenPersona(persona) {
    //Recibe el objeto "persona" desde el evento del componente hijo
    this.persona = persona;
    this.updatePersona();
  }

  async updatePersona() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);
    let mensaje: string;
    let result = await this._usuariosService.updatePersona(
      '/usuarios',
      this.persona,
      this.persona.persona_id
    );

    if (result instanceof HttpErrorResponse) {
      mensaje = `${result.error['message']} -- ${result.error['status']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: 'Algo falló',
        text: mensaje,
      });
    } else {
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Cambios guardados!',
        text: 'Espere...',
        didOpen: () => {
          this.activarEdicion();
        },
      });
    }

    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);
  }

  confirmaGuardado() {
    let mensaje = this.isOwner
      ? 'Su Sesión se cerrará. Deberá hacer Log In nuevamente'
      : 'Se actualizarán los Datos de Acceso del Usuario';
    this._alertas.confirmDialog
      .fire({
        title: 'Guardar Datos de Usuario',
        text: mensaje,
        icon: 'warning',
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se invoca el método que guarda en la DB
          this.updateUsuario();
        }
      });
  }

  async updateUsuario() {
    this.loading = true;
    let mensaje: string;

    let result = await this._usuariosService.updateUsuario(
      this.editUsuario.value,
      this.usuario.usuario_id
    );

    if (result instanceof HttpErrorResponse) {
      mensaje = `${result.error['message']} -- ${result.error['status']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: 'Algo falló',
        text: mensaje,
      });
    } else {
      mensaje = this.isOwner ? 'Cerrando Sesión. Espere...' : 'Espere...';
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Cambios guardados!',
        text: mensaje,
        didOpen: () => {
          //Si este mensaje se dispara, es pq todo funcionó
          //Se limpian algunos campos
          this.passAnterior.setValue('');
          this.pass.setValue('');
          this.passConfirm.setValue('');
          this.editUsuario.updateValueAndValidity();

          //Se oculta el modal
          this.llamaModal.nativeElement.dispatchEvent(
            new Event('click', { bubbles: true })
          );

          //Si los cambios afectan al Usuario logueado, se cierra la Sesión
          if (this.isOwner) {
            this._usuariosService
              .passportLogout()
              .then(() => {
                this.route.navigateByUrl('/home');
              })
              .catch((error: HttpErrorResponse) => {
                this.errorMessage = error.error['message'];
              });
          } else {
            //Si el cambio lo hizo un Admin o Encargado, se vuelve al listado de Usuarios
            this.route.navigateByUrl('/usuarios');
          }
        },
      });
    }

    this.loading = false;
  }
}
