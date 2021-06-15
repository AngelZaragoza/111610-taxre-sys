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

import { Movil } from 'src/app/classes/movil';
import { MovilesService } from 'src/app/services/moviles.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RangoFechas } from 'src/app/classes/rango-fechas';

@Component({
  selector: 'app-form-movil',
  templateUrl: './form-movil.component.html',
})
export class FormMovilComponent implements OnInit, DoCheck, OnDestroy {
  //Atributos que pueden ser seteados desde el componente padre
  @Input() movil: Movil = new Movil();
  @Input() editar: boolean = true;
  @Input() nuevo: boolean = true;
  @Input() ready: boolean = false;
  errorMessage: string = '';

  @Output() emitEstado: EventEmitter<boolean>;
  @Output() emitMovil: EventEmitter<Movil>;

  //Formulario y listas para llenar los combos
  datosMovil: FormGroup;
  listaAdherentes: any[] = [];
  listaChoferes: any[] = [];
  listaTipos: any[] = [];
  minMaxITV: string[] = new Array(2);

  constructor(
    private _movilesService: MovilesService,
    private _usuariosService: UsuariosService,
    private formBuilder: FormBuilder
  ) {
    //Instanciar emisores para enviar información al componente padre
    this.emitEstado = new EventEmitter();
    this.emitMovil = new EventEmitter();
  }

  ngOnInit(): void {
    this.getDatosCombos();
    this.getFechasITV();
    this.initForm();
  }

  async getDatosCombos() {
    //Controlar como se ve si no hay adherentes cargados...
    this.listaAdherentes = await this._movilesService.getLista('/adherentes');

    //Si no hay adherentes cargados, no se hacen los otros llamados
    if (this.listaAdherentes[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.listaAdherentes[0]['error']['message'];
      this.ready = false;
    } else {
      this.listaChoferes = await this._movilesService.getLista('/choferes');
      this.listaTipos = await this._movilesService.getLista('/moviles/tipos');
    }
  }

  ngDoCheck(): void {
    //En cada cambio del formulario, chequea si "editar" es false
    //Cuando se cumple, setea el formulario con los datos de Persona
    if (!this.editar) {
      this.datosMovil.setValue(this.movil);
    }
  }

  initForm() {
    this.datosMovil = this.formBuilder.group({
      movil_id: new FormControl('', Validators.required),
      adherente_id: new FormControl('', Validators.required),
      tipo_movil_id: new FormControl('', Validators.required),
      // tipo_movil_id: new FormGroup({
      //   []
      // }) ,
      marca: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15),
      ]),
      modelo: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ]),
      descripcion: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(60),
      ]),
      dominio: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(9),
      ]),
      nro_habilitacion: new FormControl('', [
        Validators.required,
        Validators.maxLength(4),
      ]),
      nro_interno: new FormControl('', [
        Validators.required,
        Validators.maxLength(3),
      ]),
      anio_fabr: new FormControl('', [
        Validators.required,
        Validators.maxLength(4),
      ]),
      chofer_pref: new FormControl(''),
      fecha_itv: new FormControl(''),
      seguro: new FormControl('', Validators.maxLength(50)),
    });
  }

  cancelEdit(): void {
    //Setea "editar" en false y lo emite hacia el componente padre
    this.editar = false;

    if (this.nuevo) {
      this.datosMovil.reset();
      this.initForm();
    } else {
      this.datosMovil.reset(this.movil);
    }
    this.emitEstado.emit(this.editar);
  }

  get aniosFabr(): Number[] {
    return this._movilesService.aniosFabr;
  }

  get fechasITV(): RangoFechas {
    return this._movilesService.fechasITV;
  }

  getFechasITV(): void {
    this.minMaxITV[0] = this.fechasITV.minimo.toISOString().slice(0, 10);
    this.minMaxITV[1] = this.fechasITV.maximo.toISOString().slice(0, 10);
  }

  logFechaHora() {
    //Chequear Date Picker
    console.log(
      'Fecha Seleccionada => ',
      this.datosMovil.get('fecha_itv').value
    );
  }

  saveMovil(): void {
    console.log(`Formulario => `, this.datosMovil.value);
    let mensaje = this.nuevo
      ? '¿Los Datos son correctos?'
      : '¿Desea guardar los Cambios?';

    if (confirm(mensaje)) {
      //Recorre los campos del form y asigna los valores al objeto Móvil
      for (const key in this.datosMovil.value) {
        let value = this.datosMovil.value[key];
        if (value === '' || value === null) {
          this.movil[key] = null;
        } else {
          this.movil[key] = value;
        }
      }
      console.table(this.movil);

      //Emite el objeto movil para que lo tome el componente padre
      this.emitMovil.emit(this.movil);
    }
  }

  ngOnDestroy(): void {
    console.log('Form Móvil destruido');
  }
}
