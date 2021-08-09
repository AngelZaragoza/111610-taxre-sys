import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterStateSnapshot } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Jornada } from 'src/app/classes/jornada';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { JornadasService } from 'src/app/services/jornadas.service';
import { ViajesService } from 'src/app/services/viajes.service';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';

@Component({
  selector: 'app-form-jornada',
  templateUrl: './form-jornada.component.html',
  styles: [],
})
export class FormJornadaComponent implements OnInit {
  //Listados
  listaChoferes: any[] = [];
  listaMoviles: any[] = [];

  //Parámetros
  movParam: string;
  jrnParam: string;
  chfParam: string;
  abreJornada: boolean;

  //Auxiliares
  ready: boolean;
  loading: boolean;
  textoBoton: string = '';
  errorMessage: string = '';
  state: RouterStateSnapshot;
  alertDialog: any;

  //Form y Datos de la Jornada
  datosJornada: FormGroup;
  jornada: Jornada;

  constructor(
    private _jornadasService: JornadasService,
    private _usuariosService: UsuariosService,
    private _viajesService: ViajesService,
    private formBuilder: FormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.ready = false;
    this.alertDialog = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary',
      },
      buttonsStyling: true,
    });

    this.cargarListas(this._viajesService.isIniciado);

    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.loading = true;
      this.state = this.route.routerState.snapshot;

      //Si la ruta contiene 'cierre', setea abreJornada a true
      this.abreJornada = this.state.url.indexOf('cierre') < 0 ? true : false;
      this.textoBoton = this.abreJornada ? 'Iniciar Jornada' : 'Cerrar Jornada';

      // console.log(params);

      //Lee los parámetros enviados desde el url
      this.movParam = params.get('mov');
      this.jrnParam = params.get('jrn');
      this.chfParam = params.get('chp') || '';

      // console.log(
      //   'Abre Jornada?',
      //   this.abreJornada,
      //   'Movil?',
      //   this.movParam,
      //   'Jornada?',
      //   this.jrnParam,
      //   'Chof Pref?',
      //   this.chfParam
      // );

      this.initForm();

      if (this.abreJornada) {
        this.jornada = Jornada.jornadaDesdeJson({
          jornada_id: 0,
          movil_id: this.movParam,
          chofer_id: this.chfParam,
          turno_inicio: this._usuariosService.user['turno_id'],
          hora_inicio: new Date(this._usuariosService.user['hora_inicio']),
          turno_cierre: null,
          hora_cierre: null,
        });
        this.datosJornada.setValue(this.jornada);
        // console.log('Jornada nueva:', this.jornada);
        this.loading = false;
      } else {
        this.detalleJornada(this.jrnParam).finally(() => {
          console.table(this.jornada);
          this.datosJornada.setValue(this.jornada);
          this.datosJornada.controls['turno_cierre'].setValue(
            this._usuariosService.user['turno_id']
          );
          this.loading = false;
        });
      }
    });
  }

  async cargarListas(isIniciado: boolean) {
    //Se recuperan las listas con datos para los Viajes
    if (!isIniciado) {
      await this._viajesService.cargarListas();
    }

    this.listaChoferes = this._viajesService.listaChoferes;
    this.listaMoviles = this._viajesService.listaMoviles.map((mov) => {
      return { movil_id: mov.movil_id, nro_interno: mov.nro_interno };
    });
  }

  ngOnInit(): void {
    // this.initForm();
  }

  async detalleJornada(id: string) {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'abre_cierra_jornada');

    await this._jornadasService.detalleJornada(id).then((resp) => {
      this.jornada = Jornada.jornadaDesdeJson(resp);
    });

    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'abre_cierra_jornada');
  }

  async initForm() {
    this.datosJornada = this.formBuilder.group({
      jornada_id: new FormControl(''),
      movil_id: new FormControl('', Validators.required),
      chofer_id: new FormControl('', Validators.required),
      turno_inicio: new FormControl('', Validators.required),
      hora_inicio: new FormControl('', Validators.required),
      turno_cierre: new FormControl(''),
      hora_cierre: new FormControl(''),
    });

    if (!this.abreJornada) {
      this.datosJornada.get('hora_cierre').setValidators(Validators.required);
      this.datosJornada.updateValueAndValidity();
    }
  }

  confirmaGuardado() {
    let interno: string[] = this.listaMoviles
      .filter((mov) => (mov.movil_id == this.movParam))
      .map((int) => String(int.nro_interno).padStart(2, '0'));

    this.alertDialog
      .fire({
        title: `¿${this.textoBoton}?`,
        text: `Móvil ${interno[0]}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se llama el método que guarda la Jornada
          this.saveJornada(this.abreJornada, interno[0]);
        }
      });
  }

  async saveJornada(inicioJornada: boolean, nroInterno: string) {
    let result: any;
    let mensaje: string;

    this.loading = true;
    result = await this._jornadasService.guardarJornada(
      inicioJornada,
      this.datosJornada.value
    );
    if (result['success']) {
      mensaje = inicioJornada ? 'Jornada Iniciada: ' : 'Jornada Cerrada: ';
      this.ready = true;

      this.alertDialog.fire({
        position: 'center',
        title: `${mensaje}`,
        text: `Móvil ${nroInterno}`,
        icon: 'success',
        didDestroy: (al) => {
          //Redirigir al home si el login fue exitoso
          this.route.navigateByUrl('/jornadas');
        },
      });
    } else {
      mensaje = `${result.error.err?.code} \n ${result.statusText}\nNo se guardaron datos.`;
      this.alertDialog.fire({
        title: 'Algo falló',
        text: mensaje,
        icon: 'error',
      });
    }

    this.loading = false;
  }
}
