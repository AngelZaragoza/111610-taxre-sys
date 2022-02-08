import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { JornadasService } from 'src/app/services/jornadas.service';
import { AlertasService } from 'src/app/services/alertas.service';
import { Jornada } from 'src/app/classes/jornada';

@Component({
  selector: 'app-form-jornada',
  templateUrl: './form-jornada.component.html',
  styles: [],
})
export class FormJornadaComponent implements OnInit {
  //Listados
  choferesDisponibles: any[] = [];
  internoMovil: string;
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
  errorMessage: string;
  nombreComponente: string;

  //Form y Datos de la Jornada
  datosJornada: FormGroup;
  jornada: Jornada;

  constructor(
    private _jornadasService: JornadasService,
    private _usuariosService: UsuariosService,
    private _alertas: AlertasService,
    private formBuilder: FormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.ready = false;
    this.nombreComponente = 'abre_cierra_jornada';
    
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.errorMessage = '';
      let operacion = this.route.routerState.snapshot.url;

      //Si la ruta contiene 'cierre', setea 'abreJornada' en true
      this.abreJornada = operacion.indexOf('cierre') < 0 ? true : false;
      this.textoBoton = this.abreJornada ? 'Iniciar Jornada' : 'Cerrar Jornada';

      // Lee los parámetros enviados por url
      this.movParam = params.get('mov');
      this.jrnParam = params.get('jrn');
      this.chfParam = params.get('chp') || '';

      this.validarParametros()
        .then((interno) => {
          this.internoMovil = String(interno).padStart(2, '0');
          this.initForm();
          this.chequearOperacion();
        })
        .catch((error) => {
          this.errorMessage = error;
        });
    });
  }
  /**
   * Realiza una validación básica de los queryParams recibidos
   * (en caso que existan deben ser numéricos)
   */
  private validarParametros() {
    return new Promise((resolve, reject) => {
      if (!this.movParam || isNaN(Number(this.movParam)))
        reject('No se especificó id de Móvil, o este no es válido');
      if (this.chfParam && isNaN(Number(this.chfParam)))
        reject('El id de Chofer especificado no es válido');
      if (!this.abreJornada && (!this.jrnParam || isNaN(Number(this.jrnParam))))
        reject('El id de Jornada especificado no es válido');
      const interno = this.recuperarMovil(this.movParam);
      if (!interno) reject('El id de Móvil especificado no existe.');
      resolve(interno);
    });
  }

  /**
   * Recupera el nro Interno del Móvil para mostrar en la interfaz.
   * @param movilId id del Móvil a recuperar.
   */
  private recuperarMovil(movilId: number | string) {
    let mov = this._jornadasService.listadoMovilesJornadas.find(
      (jornada) => jornada['movil_id'] == movilId
    );

    let nro_interno = mov ? mov['nro_interno'] : null;
    return nro_interno;
  }

  /**
   * Inicializa el formulario y setea los validadores
   */
  private initForm(): void {
    this.datosJornada = this.formBuilder.group({
      jornada_id: [''],
      movil_id: ['', Validators.required],
      chofer_id: ['', Validators.required],
      turno_inicio: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      turno_cierre: [''],
      hora_cierre: [''],
    });

    if (!this.abreJornada) {
      this.datosJornada.get('hora_cierre').setValidators(Validators.required);
      this.datosJornada.updateValueAndValidity();
    }
  }

  /**
   * Si se inicia una Jornada, setea valores por defecto al formulario.
   * Si se cierra una Jornada, recupera los datos de la misma desde el servidor.
   */
  private chequearOperacion(): void {
    if (this.abreJornada) {
      this.loading = true;
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
      setTimeout(() => {
        this.loading = false;        
      }, 50);
    } else {
      this.detalleJornada(this.jrnParam).finally(() => {
        this.datosJornada.setValue(this.jornada);
        this.datosJornada.controls['turno_cierre'].setValue(
          this._usuariosService.user['turno_id']
        );
      });
    }
  }

  /**
   * Si se inicia una Jornada, filtra el listado de Choferes
   * para mostrar en el combo sólo los que estén disponibles.
   * Sino, retorna el listado completo de Choferes.
   */
  private filtrarListas(iniciaJornada: boolean): any[] {
    let disponibles: any[];
    if (iniciaJornada) {
      let ocupados = this._jornadasService.listadoMovilesJornadas.reduce(
        (ocup: any[], jornada) => {
          if (jornada['hora_cierre'] === null && jornada['chofer_id'])
            ocup.push(jornada['chofer_id']);
          return ocup;
        },
        []
      );

      disponibles = this._jornadasService.listaChoferes.filter((chofer) => {
        return !ocupados.includes(chofer['chofer_id']);
      });
    } else {
      disponibles = this._jornadasService.listaChoferes;
    }

    return disponibles;
  }

  ngOnInit(): void {
    this.choferesDisponibles = this.filtrarListas(this.abreJornada);
  }

  private async detalleJornada(id: string) {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);

    let result = await this._jornadasService.detalleJornada(id);
    if (result instanceof HttpErrorResponse) {
      this.errorMessage = result.error['message'];
    } else {
      this.jornada = Jornada.jornadaDesdeJson(result);
    }    

    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);
  }

  confirmaGuardado() {
    this._alertas.confirmDialog
      .fire({
        title: `¿${this.textoBoton}?`,
        text: `Móvil ${this.internoMovil}`,
        icon: 'question',
      })
      .then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, se invoca el método que guarda en la DB
          this.saveJornada(this.abreJornada);
        }
      });    
  }

  async saveJornada(inicioJornada: boolean) {
    let result: any;
    let mensaje: string;

    this.loading = true;
    result = await this._jornadasService.guardarJornada(
      inicioJornada,
      this.datosJornada.value
    );
    if (result instanceof HttpErrorResponse) {
      mensaje = `${result.error['message']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: `Algo falló (${result.error['status']})`,
        text: mensaje,
        didDestroy: () => {
          this.loading = false;
        },
      });
    } else {
      mensaje = inicioJornada ? 'Jornada Iniciada: ' : 'Jornada Cerrada: ';
      this.ready = true;

      this._alertas.successDialog.fire({
        position: 'center',
        title: mensaje,
        text: `Móvil ${this.internoMovil}`,
        didDestroy: () => {
          // Recargar la lista de Jornadas
          this.loading = false;
          this.route.navigateByUrl('/jornadas');
        },
      });
    }
  }
}
