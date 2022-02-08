import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AdherentesService } from '../../services/adherentes.service';
import { ChoferesService } from '../../services/choferes.service';
import {
  FormGroup,
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

  //Listado
  listaAdherentes: any[] = [];

  //Clases modelo para los objetos
  detalle: any = {};
  persona: Persona = new Persona();
  chofer: Chofer = new Chofer();

  //Formulario
  newChofer: FormGroup;

  //Auxiliares
  cantAdherentes: number;
  cargaFull: boolean;
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
    // Listo para guardar nuevo Chofer: false
    this.cantAdherentes = 0;
    this.cargaFull = false;
    this.eleccion = false;
    this.errorMessage = '';
  }

  ngOnInit(): void {
    this.getAdherentes();
    this.initForm();
  }

  /**
   * Inicializa el formulario y setea los validadores
   */
  initForm() {    
    this.newChofer = this.formBuilder.group({
      persona_id: [''],
      carnet_nro: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(22),
        Validators.pattern(/(^[\w]{2,4}-[\d]+$)|(^[\d]+$)/),
      ]],
      carnet_vence: ['', Validators.required],
      habilitado: [1],
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
    let listado: any[];

    // Si el listado en el servicio está vacío, se realiza el llamado a la BD
    if (!this._choferesService.listaAdherentes.length) {
      listado = await this._adherentesService.getAdherentes();
    } else {
      listado = this._choferesService.listaAdherentes;
    }

    if (listado instanceof HttpErrorResponse) {
      this.errorMessage = listado.error['message'];
      return;
    }
    // Se filtra la lista de Adherentes para mostrar solamente
    // aquellos que no tienen un Chofer asociado en el combo
    this.listaAdherentes = listado.filter((adherente) => {
      return !this._choferesService.listaChoferes.some(
        (chofer) => chofer['persona_id'] === adherente['persona_id']
      );
    });

    // Se setea el mensaje de error según el resultado del filtro
    this.errorMessage =
      this.listaAdherentes.length > 0
        ? ''
        : 'No hay Adherentes cargados cuyos datos puedan usarse para crear un Chofer';
  }

  nuevoDesdeCero() {
    this.cargaFull = true;
    this.eleccion = true;
    this.newChofer.reset();
    this.initForm();
  }

  nuevoDesdeAdh() {
    this.cargaFull = false;
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
    // Chequea si se carga desde un Adherente o una carga Completa
    if (!this.cargaFull) {
      // Chequea si existe el combo (Adherentes disponibles)
      if (!this.comboAdh) {
        // Se impide la apertura del modal interrumpiendo el evento del botón
        event.stopImmediatePropagation();
        return;
      }

      // Chequea si el usuario seleccionó un Adherente del combo
      let persona_id = this.comboAdh.nativeElement.value;
      if (persona_id === '') {
        // Se impide la apertura del modal interrumpiendo el evento del botón
        event.stopImmediatePropagation();

        this._alertas.problemDialog.fire({
          title: 'Error',
          text: 'Debe seleccionar un Adherente',
        });
        return;
      }

      // Setea el valor del campo del form y permite la apertura del modal
      this.newChofer.get('persona_id').setValue(persona_id);
    }
  }

  confirmaGuardado() {
    //Recibe el objeto con los datos adicionales del Chofer del form
    this.chofer = { ...this.newChofer.value };

    let mensaje = `¿Guarda el Nuevo Chofer?`;
    this._alertas.confirmDialog
      .fire({
        title: 'Guardar Datos',
        text: mensaje,
        icon: 'question',        
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
      // Si cargaFull es true, se crea un objeto "detalle" uniendo "persona" y "chofer" y se envía al servicio
      if (this.cargaFull) {
        this.detalle = { ...this.persona, ...this.chofer };        
        result = await this._choferesService.nuevoChofer(
          this.detalle,
          this.cargaFull
        );
      } else {
        //Si cargaFull es false, se envía solamente el objeto "chofer" al servicio
        result = await this._choferesService.nuevoChofer(
          this.chofer,
          this.cargaFull
        );
      }
    } catch (error) {
      result = error;
    }

    if (result instanceof HttpErrorResponse) {
      mensaje = `${result.error['message']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: `Algo falló (${result.error['status']})`,
        text: mensaje,
      });
    } else {
      mensaje = `Nuevo Chofer Creado. Espere...`;
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Chofer Guardado!',
        text: mensaje,
        didOpen: () => {
          // this.cantAdherentes = false;
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
