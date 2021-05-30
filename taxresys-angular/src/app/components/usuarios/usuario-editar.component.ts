import { Component, DoCheck } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DTODetalleUsuario } from '../../classes/detalle-usuario';
import { Persona } from '../../classes/persona';
import { Usuario } from '../../classes/usuario';

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
  testCheck = 0;  
  
  //Formulario y objeto de roles de usuario
  editUsuario: FormGroup;
  roles: any;

  constructor(
    public _usuariosService: UsuariosService,
    private activatedRoute: ActivatedRoute
  ) {    

    this.roles = this._usuariosService.roles;

    this.editUsuario = new FormGroup({
      persona_id: new FormControl(''),
      usuario_id: new FormControl(''),
      rol_id: new FormControl(''),
      alias: new FormControl(''),
      password: new FormControl(''),
    });

    //Se ejecuta con cada llamada a la ruta que renderiza este componente
    //excepto cuando el parámetro que viene con la ruta no cambia.
    //Setea "editar" en falso para evitar ediciones accidentales.
    this.activatedRoute.params.subscribe((params) => {      
      this.idPer = params['usuario_id'];
      this.testCheck++;
      this.editar = false;
      
      this.detalleUsuario(this.idPer).finally(() => {
        console.table(this.usuario);
        console.table(this.persona);        
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


  listenPersona(persona) {
    //Recibe el objeto "persona" desde el evento del componente hijo
    this.persona = persona;
    this.activarEdicion();
    console.table(this.persona);
    this.updatePersona();
  }

  async updatePersona() {
    let result = await this._usuariosService.updatePersona(this.persona, this.idPer);
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
