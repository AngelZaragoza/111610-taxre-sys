import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Turno } from 'src/app/classes/turno';
import { TurnosService } from 'src/app/services/turnos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-form-turno',
  templateUrl: './form-turno.component.html',
  styles: [
    '.box-tabla { position: relative; height: 275px; overflow-y: scroll; }',
    '.cont-tabla { position: absolute; top: 0px; left: 0px; }',
  ],
})
export class FormTurnoComponent implements OnInit {
  abreTurno: boolean = true;
  turno: Turno;
  ready: boolean;
  loading: boolean;
  textoBoton: string = '';

  //Listado de últimos turnos
  ultTurnos: any[] = [];
  cantTurnos: number = 5;
  errorMessage: string = '';

  //Formulario
  datosTurno: FormGroup;

  constructor(
    private _turnosService: TurnosService,
    private _usuariosService: UsuariosService,
    private formBuilder: FormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.ready = false;
    this.activatedRoute.params.subscribe((params) => {
      this.abreTurno = params['operacion'] === 'inicio' ? true : false;
      this.textoBoton = this.abreTurno ? 'Abrir Turno' : 'Cerrar Turno';
      console.log('|| Form Turno ||');
    });
  }

  ngOnInit(): void {
    this._usuariosService.mostrarSpinner(!this.ready, 'form_turno');
    this.turno = new Turno(this.userLogged.usuario_id);
    this.initForm();
    this.getUltimoTurno();
    this.getUltimosNTurnos(this.cantTurnos);
  }

  get userLogged(): any {
    return this._usuariosService.user;
  }

  async cambiaCant(cant: any) {
    //Recibe el valor seleccionado en el combo
    //y lo usa para actualizar el listado    
    this.cantTurnos = cant.value;
    await this.getUltimosNTurnos(this.cantTurnos);
  }
  
  async getUltimosNTurnos(cant: number) {
    let lista = await this._turnosService.getUltimosNTurnos(cant);
    if (lista[0] instanceof HttpErrorResponse) {
      this.errorMessage = lista[0]['error'].message;
    } else {
      this.ultTurnos = lista;
    }
  }

  async getUltimoTurno() {
    let result = await this._turnosService.getUltimoTurno();
    if (result.success) {
      console.table(result);
      for (const key in result.turno) {
        let value = result.turno[key];
        if (this.turno[key] !== undefined) {
          this.turno[key] = value;
        }
      }
      console.table(this.turno);
    } else {
      //Si no hay resultados, es el primer turno creado
      //Setea los valores por default con el objeto 'turno'
      this.datosTurno.setValue(this.turno);
      this.ready = true;
      return;
    }

    if (this.abreTurno) {
      //Si se está abriendo un turno Y el turno anterior fue cerrado
      if (this.turno.hora_cierre) {
        //Se carga un nuevo 'turno' en el formulario con el id del usuario logueado
        this.datosTurno.setValue(new Turno(this.userLogged.usuario_id));
        let sumaHora = new Date(this.turno.hora_inicio);
        console.log(
          'Inicio:',
          sumaHora,
          '+ 4hrs:',
          sumaHora.setTime(sumaHora.valueOf() + 1000 * 60 * 60 * 4)
        );
      } else {
        alert('Error: El turno anterior no ha sido cerrado');
        this.route.navigateByUrl('/home');
      }
    } else {
      //Si NO se está abriendo un turno Y el turno anterior NO fue cerrado
      if (this.turno.hora_cierre === null) {
        //Se cargan los datos del turno abierto en el formulario
        this.datosTurno.setValue(this.turno);
      } else {
        alert('Error: No hay turnos abiertos por cerrar');
        this.route.navigateByUrl('/home');
      }
    }

    this.ready = true;
    this._usuariosService.mostrarSpinner(!this.ready, 'form_turno');
  }

  //Inicializa el formulario
  initForm() {
    this.datosTurno = this.formBuilder.group({
      turno_id: new FormControl(''),
      usuario_id: new FormControl('', Validators.required),
      estado_pago_id: new FormControl(1, Validators.required),
      hora_inicio: new FormControl(''),
      hora_cierre: new FormControl(''),
      horas_extra: new FormControl(''),
      observaciones: new FormControl(''),
    });

    if (!this.abreTurno) {
      this.datosTurno.get('hora_cierre').setValidators(Validators.required);
      this.datosTurno.updateValueAndValidity();
    }

    // this.getUltimoTurno();
  }

  async saveTurno(inicioTurno: boolean) {
    let confirmacion: boolean = confirm(
      `${this.textoBoton} de ${this.userLogged.alias} ?`
    );
    let result: any;

    if (confirmacion) {
      this.loading = true;
      if (inicioTurno) {
        result = await this._turnosService.inicioTurno(this.datosTurno.value);
        if (result['success']) {
          alert(
            `Turno iniciado: ${this.userLogged.alias} => ${result['resp']['info']}`
          );
          this._usuariosService.checkAuth(true);
          this.route.navigateByUrl('/home');
        } else {
          alert(
            `Algo falló:\n${result.error.code} \n ${result.statusText}\nNo se guardaron datos.`
          );
        }
      } else {
        result = await this._turnosService.cierreTurno(this.datosTurno.value);
        console.log('Cerrando turno =>', result);
        if (result['success']) {
          alert(
            `Turno cerrado: ${this.userLogged.alias} => ${result['resp']['info']}`
          );
          this._usuariosService.checkAuth(true);
          this.route.navigateByUrl('/home');
        } else {
          alert(
            `Algo falló:\n${result.error.code} \n ${result.statusText}\nNo se guardaron datos.`
          );
        }
      }
      this.loading = false;
    }
  }

  cancelarForm() {
    this.route.navigateByUrl('/home');
  }
  
}
