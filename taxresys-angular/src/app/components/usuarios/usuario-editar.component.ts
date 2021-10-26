import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from '../../classes/custom.validator';

import { DTODetalleUsuario } from '../../classes/detalle-usuario';
import { Persona } from '../../classes/persona';
import { Usuario } from '../../classes/usuario';
import { UsuariosService } from '../../services/usuarios.service';
import { AlertasService } from 'src/app/services/alertas.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-usuario-editar',
  templateUrl: './usuario-editar.component.html',
  styles: [],
})
export class UsuarioEditarComponent implements OnInit, OnDestroy {
  //Crea una referencia a un elemento del DOM
  @ViewChild('toggleModal', { read: ElementRef }) llamaModal: ElementRef;

  //Clases modelo para los objetos
  detalle: DTODetalleUsuario = new DTODetalleUsuario();
  persona: Persona = new Persona();
  usuario: Usuario = new Usuario();

  // Formulario y objeto de Roles de usuario
  editUsuario: FormGroup;
  roles: any;
  checkboxSub: Subscription = new Subscription();

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
  }

  ngOnInit(): void {
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
          this.resetForm();
          // this.editUsuario.reset();
          // this.clearPasswords();
          // this.editUsuario.patchValue(this.usuario);
        } else {
          console.warn(this.errorMessage);
        }
      });
    });
    this.checkFormOptions();
  }

  // Inicialización y opciones del Form
  // ***********************************
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
          Validators.pattern(CustomValidators.ALFANUM_NO_ESPACIOS), //Sólo alfanumérico (ñ ni acentos permitidos)
        ]),
        passwordAnterior: new FormControl({ value: '', disabled: true }, [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(35),
        ]),
        password: new FormControl({ value: '', disabled: true }, [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(35),
        ]),
        passwordConfirm: new FormControl({ value: '', disabled: true }, [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(35),
        ]),
        cambiaPass: new FormControl(false),
        resetPass: new FormControl(false),
      },
      { validators: CustomValidators.confirmaPassword }
    );
  }

  /**
   * Se suscribe a los checkbox de cambio de password
   */
  checkFormOptions(): void {
    this.checkboxSub.add(
      this.cambiaPass.valueChanges.subscribe((checked) => {
        if (checked) {
          this.passAnterior.enable();
          this.pass.enable();
          this.passConfirm.enable();
        } else {
          this.clearPasswords();
          this.passAnterior.disable();
          this.pass.disable();
          this.passConfirm.disable();
        }
      })
    );

    this.checkboxSub.add(
      this.resetPass.valueChanges.subscribe((checked) => {
        if (checked) {
          this.passAnterior.disable();
          this.pass.enable();
          this.passConfirm.enable();
        } else {
          this.clearPasswords();
          this.passAnterior.disable();
          this.pass.disable();
          this.passConfirm.disable();
        }
      })
    );
  }

  /**
   * Limpia los campos de password y los marca 'pristine' y 'untouched'
   */
  clearPasswords() {
    this.passAnterior.reset('');
    this.pass.reset('');
    this.passConfirm.reset('');
  }

  /**
   * Resetea el Form y lo rellena con los datos del Usuario
   */  
  resetForm() {
    this.editUsuario.reset();
    this.clearPasswords();
    this.editUsuario.patchValue(this.usuario);
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

  get cambiaPass() {
    return this.editUsuario.get('cambiaPass');
  }

  get resetPass() {
    return this.editUsuario.get('resetPass');
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

  activarEdicion(): void {
    this.editar = !this.editar;
  }

  listenPersona(persona): void {
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
      mensaje = `${result.error['message']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: `Algo falló (${result.error['status']})`,
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

  confirmaGuardado(): void {
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
      mensaje = `${result.error['message']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: `Algo falló (${result.error['status']})`,
        text: mensaje,
      });
    } else {
      mensaje = this.isOwner ? 'Cerrando Sesión. Espere...' : 'Espere...';
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Cambios guardados!',
        text: mensaje,
        didOpen: () => {
          // Si este mensaje se dispara, todo funcionó
          // Se limpian algunos campos
          this.clearPasswords();

          // Se oculta el modal
          this.llamaModal.nativeElement.dispatchEvent(
            new Event('click', { bubbles: true })
          );

          // Si los cambios afectan al Usuario logueado, se cierra la sesión
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
            // Si el cambio lo hizo un Admin o Encargado, navega al listado de Usuarios
            this.route.navigateByUrl('/usuarios');
          }
        },
      });
    }

    this.loading = false;
  }

  ngOnDestroy(): void {
    console.log('Editar Usuario Destruido');
    this.checkboxSub.unsubscribe();
  }
}
