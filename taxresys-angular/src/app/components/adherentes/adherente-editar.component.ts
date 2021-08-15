import { Component, DoCheck, ElementRef, ViewChild } from '@angular/core';
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
  changes: boolean;

  constructor(
    public _adherentesService: AdherentesService,
    private activatedRoute: ActivatedRoute,
    private _usuariosService: UsuariosService,
    private _alertas: AlertasService
  ) {
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
      this.changes = false;

      this.detalleAdherente(this.idParam).finally(() => {
        console.table(this.adherente);
        console.table(this.persona);
        this.editAdherente.setValue(this.adherente);
        this.ready = true;
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
    this._usuariosService.mostrarSpinner(this.loading, 'adh_detalle');
    this.detalle = await this._adherentesService.detalleAdherente(id);

    for (let field in this.detalle) {
      //Toma los campos del detalle y los divide en sus respectivos objetos
      if (this.adherente[field] !== undefined)
        this.adherente[field] = this.detalle[field];
      if (this.persona[field] !== undefined)
        this.persona[field] = this.detalle[field];
    }

    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'adh_detalle');
  }

  activarEdicion() {
    this.editar = !this.editar;
  }

  listenPersona(persona) {
    //Recibe el objeto "persona" desde el evento del componente hijo
    this.persona = persona;
    this.activarEdicion();
    //console.table(this.persona);
    this.updatePersona();
  }

  async updatePersona() {    
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'adh_detalle');
    let mensaje: string;
    let result: any;

    try {
      result = await this._adherentesService.updatePersona(
        this.persona,
        this.persona.persona_id
      );
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
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Cambios guardados!',
        text: 'Espere...',
      });
    }

    // if (result['success']) {
    //   alert(`Datos Actualizados!: ${result['resp']['info']}`);
    //   // this.route.navigateByUrl('/home');
    // } else {
    //   alert(`Algo falló`);
    // }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'adh_detalle');
    this.ready = true;
  }

  confirmaGuardado() {
    let mensaje = `¿Guardar los Cambios?`;
    this._alertas.confirmDialog
      .fire({
        title: 'Datos de Adherente',
        text: mensaje,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se envía el objeto Viaje al método guardar
          this.updateAdherente();
        }
      });
  }

  async updateAdherente() {
    this.loading = true;    
    let mensaje: string;
    let result: any;
    this.adherente = this.editAdherente.value;

    try {
      result = await this._adherentesService.updateAdherente(
        this.adherente,
        this.adherente.adherente_id
      );
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
          this.changes = true;
        },
      });
    }
    // let cierraModal = document.querySelector('#toggleModal');
    // console.log(cierraModal);
    // console.log(this.llamaModal);

    //Pide confirmación para el guardado (a mejorar aspecto...)
    // if (confirm(`¿Guardar cambios?`)) {
    //   let result = await this._adherentesService.updateAdherente(
    //     this.adherente,
    //     this.adherente.adherente_id
    //   );

    //   if (result['success']) {
    //     //Envía un evento 'click' al botón que abre y cierra el modal
    //     this.llamaModal.nativeElement.dispatchEvent(
    //       new Event('click', { bubbles: true })
    //     );

    //     // cierraModal.dispatchEvent(new Event('click', { bubbles: true }));
    //     // this.llamaModal.nativeElement['modal']('toggle');
    //     alert(`Datos Actualizados!: ${result['resp']['info']}`);
    //   } else {
    //     alert(`Algo falló`);
    //   }
    // }

    this.loading = false;
  }
}
