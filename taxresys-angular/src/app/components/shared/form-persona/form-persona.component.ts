import {
  Component,
  Input,
  Output,
  EventEmitter,
  DoCheck,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Persona } from 'src/app/classes/persona';
import { AlertasService } from 'src/app/services/alertas.service';

@Component({
  selector: 'app-form-persona',
  templateUrl: './form-persona.component.html',
})
export class FormPersonaComponent implements DoCheck, OnDestroy {
  //Atributos que pueden ser seteados desde el componente padre
  @Input() persona: Persona = new Persona();
  @Input() editar: boolean = true;
  @Input() nuevo: boolean = true;
  @Input() ready: boolean = false;

  @Output() emitEstado: EventEmitter<boolean>;
  @Output() emitPersona: EventEmitter<Persona>;

  //Formulario
  datosPersona: FormGroup;
  fechaMax: Date;

  constructor(private _alertas: AlertasService) {
    console.log('Constructor =>', this.persona);

    //Para evitar que se almacene una fecha mayor a la actual
    this.fechaMax = new Date();

    //Instanciar controles del formulario con validadores
    this.datosPersona = new FormGroup({
      persona_id: new FormControl(''),
      apellido: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(40),
      ]),
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(45),
      ]),
      direccion: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
      ]),
      telefono: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.pattern('^[+0-9-]+$'),
      ]),
      email: new FormControl('', [Validators.email, Validators.maxLength(60)]),
      fecha_nac: new FormControl(''),
    });

    //Instanciar emisores para enviar información al componente padre
    this.emitEstado = new EventEmitter();
    this.emitPersona = new EventEmitter();

    console.log('Editar => ', this.editar);
  }

  ngDoCheck(): void {
    //En cada cambio del formulario, chequea si "editar" es false
    //Cuando se cumple, setea el formulario con los datos de Persona
    if (!this.editar) {
      this.datosPersona.setValue(this.persona);
    }
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

  //Métodos del componente
  //*******************
  cancelEdit() {
    //Setea "editar" en false y lo emite hacia el componente padre
    this.editar = false;
    this.ready = false;
    this.datosPersona.reset(this.persona);
    this.emitEstado.emit(this.editar);
  }

  confirmaGuardado() {
    let mensaje = this.nuevo
      ? '¿Los Datos son correctos?'
      : '¿Desea Guardar los Cambios?';
    this._alertas.confirmDialog
      .fire({
        title: 'Datos Personales',
        text: mensaje,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se envía el objeto Viaje al método guardar
          this.savePersona();
        }
      });
  }

  savePersona() {
    console.log(`Formulario => `, this.datosPersona.value);

    //Recorre los campos del form y asigna los valores al objeto Persona
    for (const key in this.datosPersona.value) {
      let value = this.datosPersona.value[key];
      if (value === '' || value === null) {
        this.persona[key] = null;
      } else {
        this.persona[key] = value;
      }
    }
    console.table(this.persona);

    //Emite el objeto persona para que lo tome el componente padre
    this.ready = true;
    this.emitPersona.emit(this.persona);
  }

  ngOnDestroy(): void {
    console.log('Form Persona destruido');
  }
}
