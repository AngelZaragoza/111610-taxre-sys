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
import { MovilesService } from 'src/app/services/moviles.service';

@Component({
  selector: 'app-form-jornada',
  templateUrl: './form-jornada.component.html',
  styles: [],
})
export class FormJornadaComponent implements OnInit {
  listaChoferes: any[] = [];

  abreJornada: boolean;
  movParam: string;
  jrnParam: string;
  chfParam: string;
  jornada: Jornada;
  ready: boolean;
  loading: boolean;
  textoBoton: string = '';
  errorMessage: string = '';

  state: RouterStateSnapshot;

  //Formulario
  datosJornada: FormGroup;

  constructor(
    private _jornadasService: JornadasService,
    private _usuariosService: UsuariosService,
    private _movilesService: MovilesService,
    private formBuilder: FormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.ready = false;

    this.listaChoferes = this._movilesService.listaChoferes;

    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.loading = true;
      this.state = this.route.routerState.snapshot;

      //Si la ruta contiene 'cierre', setea abreJornada a true
      this.abreJornada = this.state.url.indexOf('cierre') < 0 ? true : false;
      this.textoBoton = this.abreJornada ? 'Iniciar Jornada' : 'Cerrar Jornada';

      console.log(params);

      //Lee los parámetros enviados desde el url
      this.movParam = params.get('mov');
      this.jrnParam = params.get('jrn');
      this.chfParam = params.get('chp') || '';

      console.log(
        'Abre Jornada?',
        this.abreJornada,
        'Movil?',
        this.movParam,
        'Jornada?',
        this.jrnParam,
        'Chof Pref?',
        this.chfParam
      );

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
        console.log('Jornada nueva:', this.jornada);
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
    // return new Promise((resolve, reject) => {
    //   resolve(this.datosJornada);
    // });
  }

  async saveJornada(inicioJornada: boolean) {
    let result: any;
    let confirmacion: boolean = confirm(`${this.textoBoton} ?`);

    if (confirmacion) {
      let mensaje: string;
      this.loading = true;
      result = await this._jornadasService.guardarJornada(
        inicioJornada,
        this.datosJornada.value
      );
      if (result['success']) {
        mensaje = inicioJornada ? 'Jornada Iniciada: ' : 'Jornada Cerrada: ';
        mensaje += `${result['resp']['info']}`;
        alert(mensaje);
        this.ready = true;
        this.route.navigateByUrl('/jornadas');
      } else {
        
        mensaje = `Algo falló:\n${result.error.code} \n ${result.statusText}\nNo se guardaron datos.`;
        alert(mensaje);
      }

      this.loading = false;
    }
  }
}
