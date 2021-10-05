import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Chofer } from 'src/app/classes/chofer';
import { Persona } from 'src/app/classes/persona';
import { ChoferesService } from 'src/app/services/choferes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertasService } from 'src/app/services/alertas.service';

@Component({
  selector: 'app-chofer-editar',
  templateUrl: './chofer-editar.component.html',
  styles: [],
})
export class ChoferEditarComponent implements OnInit {
  //Crea una referencia a un elemento del DOM
  @ViewChild('toggleModal', { read: ElementRef }) llamaModal: ElementRef;

  //Clases modelo para los objetos
  detalle: any = {};
  persona: Persona = new Persona();
  chofer: Chofer = new Chofer();

  //Formulario de edición
  editChofer: FormGroup;

  //Auxiliares
  idParam: any;
  editar: boolean;
  loading: boolean = true;
  ready: boolean;
  errorMessage: string = '';
  nombreComponente: string;

  constructor(
    private _choferesService: ChoferesService,
    private _usuariosService: UsuariosService,
    private _alertas: AlertasService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {
    this.nombreComponente = 'chf_detalle';

    //Inicializar los controles del Form
    this.initForm();
    //Se ejecuta con cada llamada a la ruta que renderiza este componente
    //excepto cuando el parámetro que viene con la ruta no cambia.
    //Setea "editar" en falso para evitar ediciones accidentales.
    this.activatedRoute.params.subscribe((params) => {
      this.idParam = params['chofer_id'];
      this.editar = false;
      this.ready = false;

      this.detalleChofer(this.idParam).finally(() => {
        if (this.ready) {
          // console.table(this.chofer);
          // console.table(this.persona);
          this.editChofer.setValue(this.chofer);
        } else {
          console.warn(this.errorMessage);
        }
      });
    });
  }

  ngOnInit(): void {}

  initForm() {
    this.editChofer = this.formBuilder.group({
      chofer_id: new FormControl(0),
      persona_id: new FormControl(0),
      carnet_nro: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(22),
      ]),
      carnet_vence: new FormControl('', Validators.required),
      habilitado: new FormControl(1),
    });
  }

  //Métodos accesores en general
  //****************************
  get isAdmin(): boolean {
    return this._usuariosService.user['rol_id'] === 1;
  }

  get isManager(): boolean {
    return this._usuariosService.user['rol_id'] === 2;
  }

  //Accesores del Form
  //*******************
  get carnet() {
    return this.editChofer.get('carnet_nro');
  }

  get vencimiento() {
    return this.editChofer.get('carnet_vence');
  }

  //Métodos del componente
  //**********************
  async detalleChofer(id: number) {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);

    this.detalle = await this._choferesService.detalleChofer(id);
    if (this.detalle instanceof HttpErrorResponse) {
      this.ready = false;
      this.errorMessage = this.detalle.error['message'];
    } else {
      for (let field in this.detalle) {
        //Toma los campos del detalle y los divide en sus respectivos objetos
        if (this.chofer[field] !== undefined)
          this.chofer[field] = this.detalle[field];
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
      '/choferes',
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

  confirmaGuardado() {
    let mensaje = `¿Guardar los Cambios?`;
    this._alertas.confirmDialog
      .fire({
        title: 'Datos de Chofer',
        text: mensaje,
        icon: 'question',        
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se invoca el método que guarda en la DB
          this.updateChofer();
        }
      });
  }

  async updateChofer() {
    this.loading = true;
    let mensaje: string;
    this.chofer = this.editChofer.value;
    
    let result = await this._choferesService.updateChofer(
      this.chofer,
      this.chofer.chofer_id
    );
    
    if (result instanceof HttpErrorResponse) {
      mensaje = `${result.error['message']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: `Algo falló (${result.error['status']})`,
        text: mensaje,
      });
    } else {
      mensaje = 'Espere...';
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Cambios guardados!',
        text: mensaje,
        didOpen: () => {
          //Se oculta el modal
          this.llamaModal.nativeElement.dispatchEvent(
            new Event('click', { bubbles: true })
          );
        },
      });
    }

    this.loading = false;
  }
}
