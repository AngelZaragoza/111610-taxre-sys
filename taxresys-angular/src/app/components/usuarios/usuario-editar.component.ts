import { Component, DoCheck } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DTODetalleUsuario } from '../../classes/detalle-usuario';
import { Persona } from '../../classes/persona';
import { Usuario } from '../../classes/usuario';
import { confirmaPassword } from '../../classes/custom.validator';

@Component({
  selector: 'app-usuario-editar',
  templateUrl: './usuario-editar.component.html',
  styles: [],
})
export class UsuarioEditarComponent {
  idParam: any;
  editar: boolean;
  detalle: DTODetalleUsuario = new DTODetalleUsuario();
  persona: Persona = new Persona();
  usuario: Usuario = new Usuario();
  testCheck = 0;

  //Formulario y objeto de roles de usuario
  editUsuario: FormGroup;
  roles: any;
  loggedRol: any;

  constructor(
    private _usuariosService: UsuariosService,
    private activatedRoute: ActivatedRoute
  ) {
    this.roles = this._usuariosService.roles;
    
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

    //Se ejecuta con cada llamada a la ruta que renderiza este componente
    //excepto cuando el parámetro que viene con la ruta no cambia.
    //Setea "editar" en falso para evitar ediciones accidentales.
    this.activatedRoute.params.subscribe((params) => {
      this.idParam = params['usuario_id'];
      this.testCheck++;
      this.editar = false;

      this.detalleUsuario(this.idParam).finally(() => {
        console.table(this.usuario);
        console.table(this.persona);
        // this.editUsuario.setValue(this.usuario);
        this.editUsuario.get('persona_id').setValue( this.usuario.persona_id );
        this.editUsuario.get('usuario_id').setValue( this.usuario.usuario_id );
        this.editUsuario.get('rol_id').setValue( this.usuario.rol_id );
        this.editUsuario.get('alias').setValue( this.usuario.alias );
      });
    });
  }

  get isAdmin(): boolean {
    return this._usuariosService.user['rol_id'] === 1;
  }

  get rolNombre(): string {
    let nombre = this._usuariosService.roles.find((rol) => (rol.rol_id === this.usuario.rol_id));
    return nombre['nombre'];
  }

  async detalleUsuario(id) {
    this.detalle = await this._usuariosService.detalleUsuario(id);

    for (let field in this.detalle) {
      //Toma los campos del detalle y los divide en sus respectivos objetos
      if (this.usuario[field] !== undefined)
        this.usuario[field] = this.detalle[field];
      if (this.persona[field] !== undefined)
        this.persona[field] = this.detalle[field];
    }
  }

  activarEdicion() {
    this.editar = !this.editar;
  }

  listenPersona(persona) {
    //Recibe el objeto "persona" desde el evento del componente hijo
    this.persona = persona;
    this.activarEdicion();
    console.table(this.persona);
    this.updatePersona();
  }

  async updatePersona() {
    let result = await this._usuariosService.updatePersona(
      this.persona,
      this.persona.persona_id
    );
    if (result['success']) {
      alert(`Cambios guardados!: ${result['resp']['info']}`);
      // this.route.navigateByUrl('/home');
    } else {
      alert(`Algo falló`);
    }
  }
  logUsEdit() {
    console.log(this.editUsuario.value);
  }
}
