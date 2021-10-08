import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Persona } from 'src/app/classes/persona';
import { AlertasService } from 'src/app/services/alertas.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-form-persona',
  templateUrl: './form-persona.component.html',
})
export class FormPersonaComponent implements OnInit, OnDestroy {
  //Atributos que pueden ser seteados desde el componente padre
  @Input() persona: Persona = new Persona();
  @Input() editar: boolean = true;
  @Input() nuevo: boolean = true;

  //Atributos que emiten datos hacia el componente padre
  @Output() emitEstado: EventEmitter<boolean>;
  @Output() emitPersona: EventEmitter<Persona>;

  //Formulario
  datosPersona: FormGroup;
  fechaMax: Date;
  fechaMin: Date;

  constructor(
    private _usuariosService: UsuariosService,
    private _alertas: AlertasService
  ) {
    //Para evitar que se almacenen fechas inválidas
    this.fechaMax = this._usuariosService.calculaFechaMax(new Date(), 'y', -18);
    this.fechaMin = this._usuariosService.calculaFechaMax(new Date(), 'y', -120);

    //Instanciar controles del formulario con validadores
    this.initForm();

    //Instanciar emisores para enviar información al componente padre
    this.emitEstado = new EventEmitter();
    this.emitPersona = new EventEmitter();
  }

  ngOnInit(): void {
    this.datosPersona.setValue(this.persona);
  }

  initForm(): void {
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
  cancelEdit(): void {
    //Setea "editar" en false y lo emite hacia el componente padre
    this.editar = false;
    this.datosPersona.reset(this.persona);
    this.emitEstado.emit(this.editar);
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
    //Recorre los campos del form y asigna los valores al objeto Persona
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
