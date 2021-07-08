import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { confirmaPassword } from '../../classes/custom.validator';
import { DTODetalleUsuario } from '../../classes/detalle-usuario';
import { Persona } from '../../classes/persona';
import { Usuario } from '../../classes/usuario';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuario-nuevo',
  templateUrl: './usuario-nuevo.component.html',
  styles: [],
})
export class UsuarioNuevoComponent implements AfterViewInit {
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

  ngAfterViewInit(): void {
    console.log('Control => ', this.nextSlide);    
  }
  

  listenNuevo(persona) {
    //Recibe el objeto "persona" desde el evento del componente hijo
    this.persona = persona;

    //Listo para guardar nuevo usuario: true
    this.ready = true;
    console.log('Nueva Persona =>');
    console.table(this.persona);    
    this.nextSlide.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
  }

  async saveUsuario() {
    this.loading = true;

    //Recibe el objeto con los datos de "usuario" del form
    this.usuario = { ...this.newUsuario.value };
    console.table(this.usuario);

    //Pide confirmación para el guardado (a mejorar aspecto...)
    if (confirm(`Guardar nuevo Usuario: ${this.usuario.alias} ?`)) {
      //Crea un objeto "detalle" uniendo "persona" y "usuario"
      this.detalle = { ...this.persona, ...this.usuario };
      console.log('Resultado final =>');
      console.table(this.detalle);

      //Envia el objeto "detalle" al servicio para guardar en la DB
      let result = await this._usuariosService.nuevoUsuarioFull(this.detalle);
      if (result['success']) {
        alert(`Usuario agregado: ${result['user']['alias']} !`);
        this.route.navigateByUrl('/home');
      } else {
        alert(`Algo falló`);
      }
    }
    
    this.loading = false;
  }
}
