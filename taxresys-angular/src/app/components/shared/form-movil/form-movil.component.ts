import {
  Component,
  Input,
  Output,
  EventEmitter,
  DoCheck,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom.validator';

import { Movil } from 'src/app/classes/movil';
import { RangoFechas } from 'src/app/classes/rango-fechas';
import { MovilesService } from 'src/app/services/moviles.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { AlertasService } from 'src/app/services/alertas.service';

@Component({
  selector: 'app-form-movil',
  templateUrl: './form-movil.component.html',
})
export class FormMovilComponent implements OnInit, DoCheck, OnDestroy {
  //Atributos que pueden ser seteados desde el componente padre
  @Input() movil: Movil = new Movil();
  @Input() editar: boolean = true;
  @Input() nuevo: boolean = true;
  @Input() loading: boolean;
  @Input() ready: boolean = false;
  @Input() listaAdherentes: any[] = [];
  @Input() listaChoferes: any[] = [];
  @Input() listaTipos: any[] = [];

  @Output() emitEstado: EventEmitter<boolean>;
  @Output() emitMovil: EventEmitter<Movil>;

  //Formulario y listas para llenar los combos
  datosMovil: FormGroup;

  //Auxiliares
  errorMessage: string = '';
  aniosValidos: number[];

  constructor(
    private _movilesService: MovilesService,
    private _usuariosService: UsuariosService,
    private _alertas: AlertasService,
    private fb: FormBuilder
  ) {
    //Instanciar emisores para enviar información al componente padre
    this.emitEstado = new EventEmitter();
    this.emitMovil = new EventEmitter();

    //Setear rango máximo de años de fabricación de un Móvil
    //En Jesús María, la antigüedad máxima es de 10 años
    this.aniosValidos = this._movilesService.aniosValidos(10);
  }

  ngOnInit(): void {
    this.loading = true;
    this.initForm();
    this.loading = false;
  }

  ngDoCheck(): void {
    //En cada cambio del formulario, chequea si "editar" es false
    //Cuando se cumple, setea el formulario con los datos del Móvil
    if (!this.editar) {
      this.datosMovil.setValue(this.movil);
    }
  }

  initForm() {
    this.datosMovil = this.fb.group({
      movil_id: new FormControl(''),
      adherente_id: new FormControl('', Validators.required),
      tipo_movil_id: new FormControl('', Validators.required),
      marca: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15),
        Validators.pattern(CustomValidators.ALFANUM_NO_SIMBOLOS),
      ]),
      modelo: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(CustomValidators.ALFANUM_NO_SIMBOLOS),
      ]),
      descripcion: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(60),
        Validators.pattern(CustomValidators.ALFANUM_NO_SIMBOLOS),
      ]),
      dominio: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(9),
        CustomValidators.validaPatente,
      ]),
      nro_habilitacion: new FormControl('', [
        Validators.required,
        Validators.maxLength(4),
        Validators.pattern(CustomValidators.NUMERICO),
      ]),
      nro_interno: new FormControl('', [
        Validators.required,
        Validators.maxLength(3),
        Validators.pattern(CustomValidators.NUMERICO),
      ]),
      anio_fabr: new FormControl('', [
        Validators.required,
        Validators.maxLength(4),
        Validators.pattern(CustomValidators.NUMERICO),
      ]),
      chofer_pref: new FormControl(''),
      fecha_itv: new FormControl(''),
      seguro: new FormControl('', [
        Validators.maxLength(50),
        Validators.pattern(CustomValidators.ALFANUM_NO_SIMBOLOS),
      ]),
    });
  }

  //Métodos accesores en general
  //****************************
  get aniosFabr(): Number[] {
    return this.aniosValidos;
  }

  get fechasITV(): RangoFechas {
    return this._movilesService.fechasITV;
  }

  //Accesores del Form
  //*******************
  get tipoMovil() {
    return this.datosMovil.get('tipo_movil_id');
  }

  get adherente() {
    return this.datosMovil.get('adherente_id');
  }

  get fabricado() {
    return this.datosMovil.get('anio_fabr');
  }

  get marca() {
    return this.datosMovil.get('marca');
  }

  get modelo() {
    return this.datosMovil.get('modelo');
  }

  get descripcion() {
    return this.datosMovil.get('descripcion');
  }

  get dominio() {
    return this.datosMovil.get('dominio');
  }

  get habilitacion() {
    return this.datosMovil.get('nro_habilitacion');
  }

  get nroInterno() {
    return this.datosMovil.get('nro_interno');
  }

  get seguro() {
    return this.datosMovil.get('seguro');
  }

  //Métodos del componente
  //**********************
  cancelEdit(): void {
    if (this.nuevo) {
      this.datosMovil.reset();
      this.initForm();
    } else {
      this.datosMovil.reset(this.movil);
      // Setea "editar" en false y lo emite hacia el componente padre
      this.editar = false;
      this.emitEstado.emit(this.editar);
    }
  }

  confirmaGuardado() {
    let mensaje = this.nuevo
      ? '¿Los Datos son correctos?'
      : '¿Desea Guardar los Cambios?';
    this._alertas.confirmDialog
      .fire({
        title: 'Guardar Móvil',
        text: mensaje,
        icon: 'question',
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se llama el método guardar
          this.saveMovil();
        }
      });
  }

  saveMovil(): void {
    // Recorre los campos del form y asigna los valores al objeto 'movil'
    for (const key in this.datosMovil.value) {
      let value = this.datosMovil.value[key];
      if (value === '' || value === null) {
        this.movil[key] = null;
      } else {
        this.movil[key] = value;
      }
    }
    // Emite el objeto 'movil' para que lo tome el componente padre
    this.emitMovil.emit(this.movil);
    this.datosMovil.reset(this.movil);
  }

  ngOnDestroy(): void {
    console.log('Form Móvil destruido');
  }
}
