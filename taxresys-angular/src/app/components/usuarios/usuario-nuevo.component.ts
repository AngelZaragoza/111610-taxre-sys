import { Component, OnInit } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DTODetalleUsuario } from 'src/app/classes/detalle-usuario';
import { Persona } from 'src/app/classes/persona';
import { Usuario } from 'src/app/classes/usuario';

@Component({
  selector: 'app-usuario-nuevo',
  templateUrl: './usuario-nuevo.component.html',
  styles: [],
})
export class UsuarioNuevoComponent implements OnInit {
  newPersona: FormGroup;
  newUsuario: FormGroup;
  detalle: DTODetalleUsuario = new DTODetalleUsuario();
  persona: Persona = new Persona();
  usuario: Usuario = new Usuario();
  roles: any;

  constructor(private _usuariosService: UsuariosService) {
    this.roles = this._usuariosService.roles;

    // this.newPersona = new FormGroup({
    //   apellido: new FormControl('', [
    //     Validators.required,
    //     Validators.minLength(3),
    //     Validators.maxLength(40),
    //   ]),
    //   nombre: new FormControl('', [
    //     Validators.required,
    //     Validators.minLength(3),
    //     Validators.maxLength(45),
    //   ]),
    //   direccion: new FormControl('', [
    //     Validators.required,
    //     Validators.minLength(5),
    //     Validators.maxLength(50),
    //   ]),
    //   telefono: new FormControl('', [
    //     Validators.required,
    //     Validators.minLength(6),
    //     Validators.maxLength(20),
    //   ]),
    //   email: new FormControl('', [Validators.email, Validators.maxLength(60)]),
    //   fecha_nac: new FormControl(''),
    //   alias: new FormControl('', [
    //     Validators.required,
    //     Validators.minLength(5),
    //     Validators.maxLength(20),
    //   ]),
    //   password: new FormControl('', [
    //     Validators.required,
    //     Validators.minLength(5),
    //     Validators.maxLength(35),
    //   ]),
    //   rol_id: new FormControl(''),
    // });

    this.newUsuario = new FormGroup({
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
      rol_id: new FormControl(''),
    });
  }

  ngOnInit(): void {}

  listenNuevo(persona) {
    
    this.persona = persona;
    console.log('Nueva Persona =>');
    console.table(this.persona);
  }
}
