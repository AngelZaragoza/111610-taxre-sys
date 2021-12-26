import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom.validator';
import { HttpErrorResponse } from '@angular/common/http';
import { Turno } from 'src/app/classes/turno';
import { TurnosService } from 'src/app/services/turnos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { AlertasService } from 'src/app/services/alertas.service';

@Component({
  selector: 'app-form-turno',
  templateUrl: './form-turno.component.html',
  styles: [
    '.box-tabla { position: relative; height: 275px; overflow-y: scroll; }',
    '.cont-tabla { position: absolute; top: 0px; left: 0px; }',
  ],
})
export class FormTurnoComponent implements OnInit {
  // Listado de últimos turnos
  ultTurnos: any[] = [];
  cantTurnos: number = 5;

  // Formulario y objeto turno
  datosTurno: FormGroup;
  turno: Turno;

  // Auxiliares
  abreTurno: boolean = true;
  ready: boolean;
  loading: boolean;
  textoBoton: string = '';
  errorMessage: string = '';
  nombreComponente: string;

  constructor(
    private _turnosService: TurnosService,
    private _usuariosService: UsuariosService,
    private _alertas: AlertasService,
    private formBuilder: FormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.ready = false;
    this.nombreComponente = 'form_turno';
    this.activatedRoute.params.subscribe((params) => {
      this.abreTurno = params['operacion'] === 'inicio' ? true : false;
      this.textoBoton = this.abreTurno ? 'Abrir Turno' : 'Cerrar Turno';
    });
  }

  ngOnInit(): void {
    this._usuariosService.mostrarSpinner(!this.ready, this.nombreComponente);
    this.getUltimoTurno();
    this.getUltimosNTurnos(this.cantTurnos);
    this.initForm();
  }

  /**
   * Inicializa los controles del Form
   */
  initForm() {
    this.datosTurno = this.formBuilder.group({
      turno_id: new FormControl(''),
      usuario_id: new FormControl('', Validators.required),
      estado_pago_id: new FormControl(1, Validators.required),
      hora_inicio: new FormControl('', Validators.required),
      hora_cierre: new FormControl(''),
      horas_extra: new FormControl(0),
      observaciones: new FormControl(
        '',
        Validators.pattern(CustomValidators.ALFANUM_NO_SIMBOLOS)
      ),
    });

    if (!this.abreTurno) {
      this.hora_cierre.setValidators(Validators.required);
      this.datosTurno.updateValueAndValidity();
    }
  }

  //Métodos accesores en general
  //****************************
  get userLogged(): any {
    return this._usuariosService.user;
  }

  //Accesores del Form
  //*******************
  get hora_inicio() {
    return this.datosTurno.get('hora_inicio');
  }

  get hora_cierre() {
    return this.datosTurno.get('hora_cierre');
  }

  //Métodos del componente
  //**********************

  /**
   * Recibe el valor seleccionado en el combo
   * y lo usa para actualizar el listado
   */
  async cambiaCant(cant: any) {
    this.cantTurnos = cant.value;
    await this.getUltimosNTurnos(this.cantTurnos);
  }

  async getUltimosNTurnos(cant: number) {
    let lista = await this._turnosService.getUltimosNTurnos(cant);
    if (lista instanceof HttpErrorResponse) {
      this.errorMessage = lista.error['message'];
    } else {
      this.ultTurnos = lista;
    }
  }

  /**
   * Verifica si el Inicio o Cierre del Turno es válido
   */
  chequearOperacion() {
    // Si se intenta abrir un turno Y el turno anterior fue cerrado
    // se setea el form con un nuevo 'turno' con el id del usuario logueado
    if (this.abreTurno && this.turno.hora_cierre) {
      this.datosTurno.setValue(new Turno(this.userLogged.usuario_id));
      this.hora_inicio.setValue(this.turno.hora_cierre);
      return;
    }

    // Si se intenta abrir un turno Y el turno anterior NO fue cerrado
    // se muestra un mensaje de error y se redirige a Home
    if (this.abreTurno && !this.turno.hora_cierre) {
      this._alertas.problemDialog.fire({
        title: `Algo falló`,
        text: 'El turno anterior no ha sido cerrado',
        didDestroy: () => {
          this.route.navigateByUrl('/home');
        },
      });
    }

    // Si se intenta cerrar un turno Y el turno anterior NO fue cerrado
    // se setea los valores del form con el 'turno' recuperado
    if (!this.abreTurno && this.turno.hora_cierre === null) {
      this.datosTurno.setValue(this.turno);
    }
  }

  async getUltimoTurno() {
    this.turno = new Turno(this.userLogged.usuario_id);
    let result = await this._turnosService.getUltimoTurno();
    // Si hay un resultado, se asignan los valores
    // al objeto 'turno' y se chequea la operación a realizar.
    if (result.success) {
      for (const key in result.turno) {
        let value = result.turno[key];
        if (this.turno[key] !== undefined) {
          this.turno[key] = value;
        }
      }
      this.chequearOperacion();
    } else if (this.abreTurno) {
      // Si no hay un resultado, se trata del primer turno creado.
      // Setea los valores del form con el objeto 'turno' recién creado.
      this.datosTurno.setValue(this.turno);
      // return;
    } else {
      this._alertas.problemDialog.fire({
        title: `Algo falló (${result.status})`,
        text: 'No hay turnos abiertos por cerrar',
        didDestroy: () => {
          this.route.navigateByUrl('/home');
        },
      });
    }
    this.ready = true;
    this._usuariosService.mostrarSpinner(!this.ready, this.nombreComponente);
  }

  confirmaGuardado() {
    // Verificación al intentar cerrar un turno:
    if (!this.abreTurno) {
      // Compara el id del usuario logueado con el usuario que abrió el último turno
      let isOwner =
        this._usuariosService.user.usuario_id ===
        this._usuariosService.user.owner;

      if (!isOwner) {
        this._alertas.infoDialog.fire({
          title: 'Usuario incorrecto',
          text: `Sólo puede cerrar el Turno actual el mismo Usuario que lo abrió. 
                  Intente cambiando de Usuario.`,
        });
        return;
      }
    }

    let title = this.textoBoton;
    let mensaje = `¿${this.textoBoton} de ${this.userLogged.alias}?`;
    this._alertas.confirmDialog
      .fire({
        title,
        text: mensaje,
        icon: 'question',
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se llama el método guardar
          this.saveTurno();
        }
      });
  }

  async saveTurno() {
    let mensaje: string = '';
    let result: any;
    this.loading = true;

    if (this.abreTurno) {
      result = await this._turnosService.inicioTurno(this.datosTurno.value);
    } else {
      result = await this._turnosService.cierreTurno(this.datosTurno.value);
    }

    if (result instanceof HttpErrorResponse) {
      mensaje = `${result.error['message']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: `Algo falló (${result.status})`,
        text: mensaje,
        didDestroy: () => {
          this.loading = false;
        },
      });
    } else {
      this._usuariosService.checkAuth();
      mensaje = this.abreTurno ? 'Turno Abierto' : 'Turno Cerrado';
      this._alertas.successDialog.fire({
        position: 'center',
        title: mensaje,
        text: 'Espere...',
        didDestroy: () => {
          this.loading = false;
          this.route.navigateByUrl('/home');
        },
      });
    }
  }

  cancelarForm() {
    this.route.navigateByUrl('/home');
  }
}
