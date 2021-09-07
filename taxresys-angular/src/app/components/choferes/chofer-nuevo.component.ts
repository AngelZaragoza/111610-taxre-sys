import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AdherentesService } from '../../services/adherentes.service';
import { ChoferesService } from '../../services/choferes.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';

import { Persona } from '../../classes/persona';
import { Chofer } from '../../classes/chofer';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertasService } from 'src/app/services/alertas.service';

@Component({
  selector: 'app-chofer-nuevo',
  templateUrl: './chofer-nuevo.component.html',
  styles: [],
})
export class ChoferNuevoComponent implements OnInit {
  //Crea una referencia a un elemento del DOM
  @ViewChild('comboAdh', { read: ElementRef }) comboAdh: ElementRef;
  @ViewChild('formCarnet', { read: ElementRef }) formCarnet: ElementRef;

  lista: any[] = [];

  //Clases modelo para los objetos
  detalle: any = {};
  persona: Persona = new Persona();
  chofer: Chofer = new Chofer();

  //Formulario
  newChofer: FormGroup;

  //Auxiliares
  ready: boolean;
  nuevo: boolean;
  loading: boolean;
  eleccion: boolean;
  errorMessage: string;

  constructor(
    private _adherentesService: AdherentesService,
    private _choferesService: ChoferesService,
    private formBuilder: FormBuilder,
    private _alertas: AlertasService,
    private route: Router
  ) {
    //Listo para guardar nuevo Chofer: false
    this.ready = false;
    this.nuevo = false;
    this.eleccion = false;
    this.errorMessage = '';
  }

  ngOnInit(): void {
    this.getAdherentes();
    this.initForm();
  }

  //Inicializa el formulario con valores por defecto
  initForm() {
    this.newChofer = this.formBuilder.group({
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

  //Accesores del Form
  //*******************
  get carnet() {
    return this.newChofer.get('carnet_nro');
  }

  get vencimiento() {
    return this.newChofer.get('carnet_vence');
  }

  //Métodos del componente
  //**********************
  //Recupera la lista de Adherentes
  async getAdherentes() {
    try {
      this.lista = await this._adherentesService.getAdherentes();
      this.errorMessage = '';
      this.ready = true;
    } catch (error) {
      this.errorMessage = error.error?.message;
    }
  }

  nuevoDesdeCero() {
    this.nuevo = true;
    this.eleccion = true;
    this.newChofer.reset();
    this.initForm();
  }

  nuevoDesdeAdh() {
    this.nuevo = false;
    this.eleccion = true;
    this.newChofer.reset();
    this.initForm();
  }

  listenNuevo(persona: Persona) {
    //Recibe el objeto "persona" desde el evento del componente hijo
    this.persona = persona;    

    //Invoca el click en el botón oculto    
    this.formCarnet.nativeElement.dispatchEvent(
      new Event('click', { bubbles: true, cancelable: true })
    );
  }

  //Muestra el modal con el formulario para los datos del Carnet
  modalCarnet(event?: Event) {
    let persona_id;
    // console.log('Evento =>', event);

    if (!this.nuevo) {
      persona_id = this.comboAdh.nativeElement.value;
      console.log('Combo value => ', persona_id);

      //Si el usuario no seleccionó un Adherente del combo...
      if (persona_id === '') {
        //Se impide la apertura del modal interrumpiendo el botón
        event.stopImmediatePropagation();

        this._alertas.problemDialog.fire({
          title: 'Error',
          text: 'Debe seleccionar un Adherente',
        });
      } else {
        //Setea el valor en el campo correspondiente del form y abre el modal
        this.newChofer.get('persona_id').setValue(persona_id);
      }
    }
  }

  confirmaGuardado() {
    //Recibe el objeto con los datos adicionales del Chofer del form
    this.chofer = { ...this.newChofer.value };

    let mensaje = `¿Guarda el Nuevo Chofer: ${this.persona.apellido}, ${this.persona.nombre}?`;
    this._alertas.confirmDialog
      .fire({
        title: 'Guardar Datos',
        text: mensaje,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se llama el método que guarda en la DB
          this.saveChofer();
        }
      });
  }

  async saveChofer() {
    this.loading = true;
    let mensaje: string;
    let result: any;

    try {
      //Si nuevo es true, se crea un objeto "detalle" uniendo "persona" y "chofer" y se envía al servicio
      if (this.nuevo) {
        this.detalle = { ...this.persona, ...this.chofer };
        // console.table(this.detalle);
        result = await this._choferesService.nuevoChofer(
          this.detalle,
          this.nuevo
        );
      } else {
        //Si nuevo es false, se envía solamente el objeto "chofer" al servicio
        result = await this._choferesService.nuevoChofer(
          this.chofer,
          this.nuevo
        );
      }
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
      mensaje = `Nuevo Chofer Creado. Espere...`;
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Chofer Guardado!',
        text: mensaje,
        didOpen: () => {
          this.ready = false;
          this.formCarnet.nativeElement.dispatchEvent(
            new Event('click', { bubbles: true })
          );
          this.route.navigateByUrl('/choferes');
        },
      });
    }
    this.loading = false;
  }
}
