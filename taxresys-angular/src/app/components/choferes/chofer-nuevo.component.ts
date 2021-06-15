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

@Component({
  selector: 'app-chofer-nuevo',
  templateUrl: './chofer-nuevo.component.html',
  styles: [],
})
export class ChoferNuevoComponent implements OnInit {
  //Crea una referencia a un elemento del DOM
  @ViewChild('comboAdh', { read: ElementRef }) comboAdh: ElementRef;
  @ViewChild('carnet', { read: ElementRef }) carnet: ElementRef;

  lista: any[] = [];

  //Clases modelo para los objetos
  detalle: any = {};
  persona: Persona = new Persona();
  chofer: Chofer = new Chofer();

  //Formulario
  newChofer: FormGroup;

  //Listo para guardar nuevo Chofer
  ready: boolean;
  nuevo: boolean;
  eleccion: boolean;

  constructor(
    private _adherentesService: AdherentesService,
    private _choferesService: ChoferesService,
    private formBuilder: FormBuilder,
    private route: Router
  ) {
    //Listo para guardar nuevo Chofer: false
    this.ready = false;
    this.nuevo = false;
    this.eleccion = false;
  }

  ngOnInit(): void {
    this.getAdherentes();
    this.initForm();
  }

  //Recupera la lista de Adherentes
  async getAdherentes() {
    this.lista = await this._adherentesService.getAdherentes();
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

    //Listo para guardar nuevo chofer: true
    this.ready = true;
    console.log('Nueva Persona =>');
    console.table(this.persona);

    //Invoca el click en el botón oculto
    console.log(this.carnet);
    this.carnet.nativeElement.dispatchEvent(
      new Event('click', { bubbles: true, cancelable: true })
    );
  }

  //Muestra el modal con el formulario para los datos del Carnet
  modalCarnet(event?: Event) {
    let persona_id;
    console.log('Evento =>', event);

    if (!this.nuevo) {
      persona_id = this.comboAdh.nativeElement.value;
      console.log('Combo value => ', persona_id);

      //Si el usuario no seleccionó un Adherente del combo...
      if (persona_id === '') {
        //Se impide la apertura del modal interrumpiendo el botón
        event.stopImmediatePropagation();

        //A mejorar aspecto...
        alert('Debe seleccionar un Adherente');
      } else {
        //Setea el valor en el campo correspondiente del form y abre el modal
        this.newChofer.get('persona_id').setValue(persona_id);
      }
    }
  }

  async saveChofer() {
    this.chofer = { ...this.newChofer.value };

    //Pide confirmación para el guardado (a mejorar aspecto...)
    if (confirm(`Guardar nuevo Chofer?`)) {
      let result: any;
      //Si nuevo es true, se crea un objeto "detalle" uniendo "persona" y "chofer" y se envía al servicio
      if (this.nuevo) {
        this.detalle = { ...this.persona, ...this.chofer };
        console.table(this.detalle);
        result = await this._choferesService.nuevoChofer(
          this.detalle,
          this.nuevo
        );
      } else {
        //Si nuevo es false, se envía el objeto "chofer" al servicio
        result = await this._choferesService.nuevoChofer(
          this.chofer,
          this.nuevo
        );
      }

      if (result instanceof HttpErrorResponse) {
        alert(
          `Algo falló:\n${result.error.err?.code} \n ${result.statusText}\nNo se guardaron datos.`
        );
      } else {
        alert(`Nuevo Chofer guardado!`);
        let cerrar = document.querySelector('#cerrar');
        cerrar.dispatchEvent(new Event( 'click', { bubbles: true } ));
        this.route.navigateByUrl('/home');
      }
    }
  }

  logDetalleNuevo() {}
}
