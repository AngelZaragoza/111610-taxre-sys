import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdherentesService } from '../../services/adherentes.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Persona } from '../../classes/persona';
import { Adherente } from '../../classes/adherente';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertasService } from 'src/app/services/alertas.service';

@Component({
  selector: 'app-adherente-editar',
  templateUrl: './adherente-editar.component.html',
  styles: [],
})
export class AdherenteEditarComponent {
  //Crea una referencia a un elemento del DOM
  @ViewChild('toggleModal', { read: ElementRef }) llamaModal: ElementRef;

  //Clases modelo para los objetos
  detalle: any = {};
  persona: Persona = new Persona();
  adherente: Adherente = new Adherente();

  //Formulario de edición
  editAdherente: FormGroup;

  //Auxiliares
  idParam: any;
  editar: boolean;
  loading: boolean;
  ready: boolean;
  errorMessage: string = '';
  nombreComponente: string;

  constructor(
    public _adherentesService: AdherentesService,
    private activatedRoute: ActivatedRoute,
    private _usuariosService: UsuariosService,
    private _alertas: AlertasService
  ) {
    this.nombreComponente = 'adh_detalle';

    //Inicializar los controles del Form
    this.editAdherente = new FormGroup({
      persona_id: new FormControl(0),
      adherente_id: new FormControl(0),
      moviles_activos: new FormControl(0),
      observaciones: new FormControl('', Validators.maxLength(300)),
    });

    //Se ejecuta con cada llamada a la ruta que renderiza este componente
    //excepto cuando el parámetro que viene con la ruta no cambia.
    //Setea "editar" en falso para evitar ediciones accidentales.
    this.activatedRoute.params.subscribe((params) => {
      this.idParam = params['adherente_id'];
      this.editar = false;
      this.ready = false;

      this.detalleAdherente(this.idParam).finally(() => {
        if (this.ready) {          
          this.editAdherente.setValue(this.adherente);
        } else {
          console.warn(this.errorMessage);
        }
      });
    });
  }

  ngOnInit(): void {}

  //Métodos accesores en general
  //****************************
  get isAdmin(): boolean {
    return this._usuariosService.user['rol_id'] === 1;
  }

  get isManager(): boolean {
    return this._usuariosService.user['rol_id'] == 2;
  }

  //Accesores del Form
  //*******************
  get observaciones() {
    return this.editAdherente.get('observaciones');
  }

  //Métodos del componente
  //**********************
  async detalleAdherente(id) {
    this.loading = true;    
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);

    this.detalle = await this._adherentesService.detalleAdherente(id);
    if (this.detalle instanceof HttpErrorResponse) {
      this.ready = false;
      this.errorMessage = this.detalle.error['message'];
    } else {
      for (let field in this.detalle) {
        //Toma los campos del detalle y los divide en sus respectivos objetos
        if (this.adherente[field] !== undefined)
          this.adherente[field] = this.detalle[field];
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
      '/adherentes',
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
    let mensaje = `¿Guardar los Cambios?`;
    this._alertas.confirmDialog
      .fire({
        title: 'Datos de Adherente',
        text: mensaje,
        icon: 'question',
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se invoca el método que guarda en la DB
          this.updateAdherente();
        }
      });
  }

  async updateAdherente() {
    this.loading = true;
    let mensaje: string;
    this.adherente = this.editAdherente.value;

    let result = await this._adherentesService.updateAdherente(
      this.adherente,
      this.adherente.adherente_id
    );

    if (result instanceof HttpErrorResponse) {
      mensaje = `${result.error['message']} -- ${result.error['status']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: 'Algo falló',
        text: mensaje,
      });
    } else {
      mensaje = 'Espere...';
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Cambios guardados!',
        text: mensaje,
        didOpen: () => {
          //Si este mensaje se dispara, es pq todo funcionó
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
