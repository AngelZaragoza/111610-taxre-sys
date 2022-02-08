import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  Input,
  Output,
  OnInit,
  OnDestroy,
  EventEmitter,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Viaje } from 'src/app/classes/viaje.model';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ViajesService } from 'src/app/services/viajes.service';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';

@Component({
  selector: 'app-form-viaje',
  templateUrl: './form-viaje.component.html',
  styles: [],
})
export class FormViajeComponent implements OnInit, OnDestroy {
  //Receptores de información
  @Input() userLogged: any;
  @Input() tiposViaje: any[] = [];
  @Input() estadosViaje: any[] = [];
  @Input() listaMovilesJornadas: any[] = [];
  @Input() listaChoferes: any[] = [];
  @Input() tipo: number;
  @Input() estado: number;
  @Input() asignaPendiente: any = null;

  //Emisores
  @Output() emitCerrar: EventEmitter<boolean>;
  @Output() emitViajeGuardado: EventEmitter<Viaje>;

  //Form y Datos del Viaje
  datosViaje: FormGroup;
  newViaje: any;

  //Auxiliares
  loading: boolean = false;
  fechaMin: Date;
  fechaMax: Date;
  alertDialog: any;

  constructor(
    private _usuariosService: UsuariosService,
    private _viajesService: ViajesService,
    private fb: FormBuilder
  ) {
    //Inicializar los controles del Form
    this.initForm();

    //Instanciar emisores para enviar información al componente padre
    this.emitCerrar = new EventEmitter();
    this.emitViajeGuardado = new EventEmitter();

    this.alertDialog = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary',
      },
      buttonsStyling: true,
    });
  }

  ngOnInit(): void {
    //Setea límites para las Fechas y Horas de los Viajes:
    //Mínimo: hora de inicio del Turno del Operador
    //Máximo: 24 hrs desde el inicio del Turno del Operador
    this.fechaMin = new Date(this.userLogged.hora_inicio);
    if (this.tipo == 2 && !this.asignaPendiente) {
      //Si el Viaje es de tipo Pendiente, no se setea un límite máximo
      //y se quita el requisito de elegir un Móvil
      this.fechaMax = null;
      this.jornada.clearValidators();
    } else {
      //Si el Viaje es de otro tipo, se setea un límite máximo
      //y se quita el requisito de elegir Fecha de Registro
      this.fechaMax = this._usuariosService.calcularFechaMaxima(
        this.fechaMin,
        24
      );
      this.registradoEn.clearValidators();
    }

    //Actualiza las reglas de validación del FormGroup
    this.datosViaje.updateValueAndValidity();

    //Crea una instancia con Algunas de las propiedades de la clase Viaje
    const viaje: Partial<Viaje> = {
      viaje_id: 0,
      usuario_id: this.userLogged.usuario_id,
      turno_id: this.userLogged.turno_id,
      jornada_id: 0,
      tipo_viaje_id: this.tipo,
      estado_viaje_id: this.estado,
      registrado: new Date(),
      fecha_hora: new Date(),
      origen_nombre: '',
      origen_altura: 0,
      observaciones: null,
    };

    //Si existe este objeto, es un Pendiente que va a ser asignado
    if (this.asignaPendiente) {
      viaje.registrado = this.asignaPendiente['registrado'];
      viaje.fecha_hora = this.asignaPendiente['fecha_hora'];
      viaje.origen_nombre = this.asignaPendiente['origen_nombre'];
      viaje.origen_altura = this.asignaPendiente['origen_altura'];
      viaje.observaciones = this.asignaPendiente['observaciones'];
    }

    this.datosViaje.setValue(viaje);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    console.log('|| Form Viaje destruido ||');
  }

  initForm() {
    this.datosViaje = this.fb.group({
      viaje_id: new FormControl(''),
      usuario_id: new FormControl(''),
      turno_id: new FormControl(''),
      jornada_id: new FormControl('', [Validators.required, Validators.min(1)]),
      tipo_viaje_id: new FormControl(''),
      estado_viaje_id: new FormControl(''),
      registrado: new FormControl('', Validators.required),
      fecha_hora: new FormControl('', Validators.required),
      origen_nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60),
      ]),
      origen_altura: new FormControl('', [
        Validators.required,
        Validators.min(0),
        Validators.max(9999),
      ]),
      observaciones: new FormControl('', Validators.maxLength(250)),
    });
  }

  //Métodos accessores
  //*******************
  get jornada() {
    return this.datosViaje.get('jornada_id');
  }

  get registradoEn() {
    return this.datosViaje.get('registrado');
  }

  get fechaHora() {
    return this.datosViaje.get('fecha_hora');
  }

  get origenNombre() {
    return this.datosViaje.get('origen_nombre');
  }

  get origenAltura() {
    return this.datosViaje.get('origen_altura');
  }

  //Métodos del componente
  //**********************

  cancelarViaje() {
    //Emite false al componente padre para cerrar el Form
    this.emitCerrar.emit(false);
  }

  confirmaGuardado() {
    let nuevoViaje = Viaje.viajeDesdeJson(this.datosViaje.value);
    let mensaje: string;

    if (nuevoViaje.tipo_viaje_id != 2 || this.asignaPendiente) {
      //Chequea si la fecha y hora del viaje es mayor o igual a la
      //fecha y hora de inicio de Jornada del Móvil
      let horaValida = this.listaMovilesJornadas
        .filter((jorn) => jorn.jornada_id == nuevoViaje.jornada_id)
        .map((mov) => {
          return {
            valida: new Date(nuevoViaje.fecha_hora) >= new Date(mov.hora_inicio),
            viaje: new Date(nuevoViaje.fecha_hora),
            jornada: new Date(mov.hora_inicio),
          };
        });

      if (!horaValida[0].valida) {
        mensaje = 'Anterior al inicio de Jornada del Móvil:';
        mensaje += `\n${horaValida[0].jornada.toLocaleDateString()} ${horaValida[0].jornada.toLocaleTimeString()}`;
        this.alertDialog.fire({
          title: 'Hora del Viaje no válida',
          text: mensaje,
          icon: 'warning',
        });
        // alert(mensaje);
        return;
      }
    }

    //Si la hora es correcta, se pide confirmación al Usuario:
    // let confirmacion = confirm('Guarda el Viaje?');
    // if (confirmacion) {
    //   //Si el usuario confirma, se envía el objeto Viaje al método guardar
    //   this.guardarViaje(nuevoViaje);
    // }
    this.alertDialog
      .fire({
        title: '¿Guardar el Viaje?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se envía el objeto Viaje al método guardar
          this.guardarViaje(nuevoViaje);
        }
      });
  }

  async guardarViaje(nuevoViaje: Viaje) {
    this.loading = true;
    let mensaje: string;
    let result: any;

    //Si existe este objeto, se crea un viaje Nuevo usando como base los datos
    //y se envía el id del pendiente para marcarlo como "asignado"
    if (this.asignaPendiente) {
      result = await this._viajesService.asignaPendiente(
        nuevoViaje,
        this.asignaPendiente.viaje_pendiente_id
      );
    } else {
      //Sino, se crea un viaje Nuevo desde cero
      if (this.tipo != 2) {
        result = await this._viajesService.nuevoViajeNormal(nuevoViaje);
      } else {
        result = await this._viajesService.nuevoViajePendiente(nuevoViaje);
      }
    }

    if (result instanceof HttpErrorResponse) {
      mensaje = `${result.error.err?.code} \n ${result.statusText}\nNo se guardaron datos.`;
      this.alertDialog.fire({        
        title: 'Algo falló',
        text: mensaje,
        icon: 'error',
      });
    } else {
      mensaje = `${nuevoViaje.origen_nombre} ${nuevoViaje.origen_altura}`;
      // alert(mensaje);
      this.alertDialog.fire({
        position: 'center',
        title: 'Viaje guardado!',
        text: mensaje,
        icon: 'success',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });

      //Completa los datos faltantes en el objeto Viaje
      this.listaMovilesJornadas
        .filter((mov) => mov.jornada_id == this.jornada.value)
        .forEach((item) => {
          nuevoViaje.movil_id = item.movil_id;
          nuevoViaje.chofer_id = item.chofer_id;
          nuevoViaje.viaje_id = result['resp'].insertId;
        });
      this._viajesService.getPendientesActivos();
      console.log('Nuevo Viaje =>', nuevoViaje);
      //Envía el objeto Viaje completo al componente padre
      this.emitViajeGuardado.emit(nuevoViaje);
    }

    this.loading = false;
  }
}
