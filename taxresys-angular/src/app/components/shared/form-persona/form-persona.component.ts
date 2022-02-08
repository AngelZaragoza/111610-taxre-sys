import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom.validator';

import { Persona } from 'src/app/classes/persona';
import { RangoFechas } from 'src/app/classes/rango-fechas';
import { AlertasService } from 'src/app/services/alertas.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-form-persona',
  templateUrl: './form-persona.component.html',
})
export class FormPersonaComponent implements OnInit, OnDestroy {
  // Atributos que pueden ser seteados desde el componente padre
  @Input() persona: Persona = new Persona();
  @Input() editar: boolean = true;
  @Input() nuevo: boolean = true;

  // Atributos que emiten datos hacia el componente padre
  @Output() emitEstado: EventEmitter<boolean>;
  @Output() emitPersona: EventEmitter<Persona>;

  // Formulario y objeto para control de fechas
  datosPersona: FormGroup;  
  rangoFechasNacim: RangoFechas;

  constructor(    
    private _utils: UtilsService,
    private _alertas: AlertasService
  ) {   

    //Instanciar emisores para enviar información al componente padre
    this.emitEstado = new EventEmitter();
    this.emitPersona = new EventEmitter();
  }

  ngOnInit(): void {
    this.initFechas();
    // Instanciar controles del formulario con validadores
    this.initForm();
    this.datosPersona.setValue(this.persona);
  }

  initForm(): void {
    this.datosPersona = new FormGroup({
      persona_id: new FormControl(''),
      apellido: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(40),
        Validators.pattern(CustomValidators.ALFANUM_NO_SIMBOLOS)
      ]),
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(45),
        Validators.pattern(CustomValidators.ALFANUM_NO_SIMBOLOS)
      ]),
      direccion: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.pattern(CustomValidators.ALFANUM_NO_SIMBOLOS)
      ]),
      telefono: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.pattern(CustomValidators.TELEFONO),
      ]),
      email: new FormControl('', [Validators.email, Validators.maxLength(60)]),
      fecha_nac: new FormControl(''),
    });
  }

  initFechas(): void {
    // Para controlar las fechas que se pueden almacenar
    let hoy = new Date();
    this.rangoFechasNacim = {
      actual: hoy,
      minimo: this._utils.calcularFecha(hoy, 'y', -120),
      maximo: this._utils.calcularFecha(hoy, 'y', -18),
    };    
  }

  //Accessores del Form
  //*******************
  get apellido() {
    return this.datosPersona.get('apellido');
  }

  get nombre() {
    return this.datosPersona.get('nombre');
  }

  get direccion() {
    return this.datosPersona.get('direccion');
  }

  get telefono() {
    return this.datosPersona.get('telefono');
  }

  get email() {
    return this.datosPersona.get('email');
  }

  get fecha_nac() {
    return this.datosPersona.get('fecha_nac');
  }

  get nacidoEn() {
    return this.rangoFechasNacim;
  }

  //Métodos del componente
  //*******************
  cancelEdit(): void {
    if(this.nuevo) {
      this.datosPersona.reset();
      this.initForm();
    } else {
      // Setea "editar" en false y lo emite hacia el componente padre
      this.editar = false;
      this.datosPersona.reset(this.persona);
      this.emitEstado.emit(this.editar);
    }
  }

  confirmaGuardado(): void {
    let mensaje = this.nuevo
      ? '¿Los Datos son correctos?'
      : '¿Desea Guardar los Cambios?';
    this._alertas.confirmDialog
      .fire({
        title: 'Datos Personales',
        text: mensaje,
        icon: 'question',
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se envía el objeto Viaje al método guardar
          this.savePersona();
        }
      });
  }

  savePersona(): void {
    // Recorre los campos del form y asigna los valores al objeto Persona
    for (const key in this.datosPersona.value) {
      let value = this.datosPersona.value[key];
      if (value === '' || value === null) {
        this.persona[key] = null;
      } else {
        this.persona[key] = value;
      }
    }

    //Emite el objeto persona para que lo tome el componente padre
    this.emitPersona.emit(this.persona);
    this.datosPersona.reset(this.persona);
  }

  ngOnDestroy(): void {
    console.log('Form Persona destruido');
  }
}
