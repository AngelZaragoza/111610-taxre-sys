import { Component, DoCheck } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DTODetalleUsuario } from 'src/app/classes/detalle-usuario';
import { Persona } from 'src/app/classes/persona';
import { Usuario } from 'src/app/classes/usuario';

@Component({
  selector: 'app-usuario-editar',
  templateUrl: './usuario-editar.component.html',
  styles: [],
})
export class UsuarioEditarComponent {
  idPer: any;
  editar: boolean;
  detalle: DTODetalleUsuario = new DTODetalleUsuario();
  persona: Persona = new Persona();
  usuario: Usuario = new Usuario();
  roles: any;
  testCheck = 0;
  editPersona: FormGroup;
  editUsuario: FormGroup;

  constructor(
    public _usuariosService: UsuariosService,
    private activatedRoute: ActivatedRoute
  ) {
    //ASIGNAR VALORES CAMPO POR CAMPO
    //******************** */
    // this.editPersona = new FormGroup({
    //   persona_id: new FormControl(''),
    //   apellido: new FormControl('', Validators.required),
    //   nombre: new FormControl('', Validators.required),
    //   direccion: new FormControl('', Validators.required),
    //   telefono: new FormControl('', Validators.required),
    //   email: new FormControl('', [Validators.email]),
    //   fecha_nac: new FormControl(''),
    // });    

    this.roles = this._usuariosService.roles;

    this.editUsuario = new FormGroup({
      persona_id: new FormControl(''),
      usuario_id: new FormControl(''),
      rol_id: new FormControl(''),
      alias: new FormControl(''),
      password: new FormControl('')
    });

    //Se ejecuta con cada llamada a la ruta que renderiza este componente
    //excepto cuando el parámetro que viene con la ruta no cambia.
    //Setea "editar" en falso para evitar ediciones accidentales.
    this.activatedRoute.params.subscribe((params) => {
      this.idPer = params;
      this.testCheck++;
      this.editar = false;      
      this.detalleUsuario(this.idPer.usuario_id).finally(() => {
        console.table(this.usuario);
        console.table(this.persona);
        // this.editPersona.setValue(this.persona);
        this.editUsuario.setValue(this.usuario);
      });
    });
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

  // cancelEdit() {
  //   this.editPersona.reset(this.persona);
  //   this.activarEdicion();
  // }

  // logEdit() {
  //   console.log(this.editPersona.value);
  // }

  logUsEdit() {
    console.log(this.editUsuario.value);
    
  }
}
