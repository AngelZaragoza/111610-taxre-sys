import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,  
} from '@angular/core';
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
import { RangoFechas } from 'src/app/classes/rango-fechas';

@Component({
  selector: 'app-form-turno',
  templateUrl: './form-turno.component.html',
  styles: [],
})
export class FormTurnoComponent implements OnInit {
  //Atributos que pueden ser seteados desde el componente padre
  abreTurno: boolean = true;
  turno: Turno;
  textoBoton: string = '';
  errorMessage: string = '';
  respuesta: any;  

  //Formulario
  datosTurno: FormGroup;

  constructor(
    private _turnosService: TurnosService,
    private _usuariosService: UsuariosService,
    private formBuilder: FormBuilder,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.abreTurno = params['operacion'] === 'inicio' ? true : false;
      this.textoBoton = this.abreTurno ? 'Abrir Turno' : 'Cerrar Turno';
    });
  }

  ngOnInit(): void {
    this.turno = new Turno(this.userLogged.usuario_id);
    this.initForm();
    this.getUltimoTurno();
  }

  //Recupera datos del servicio de Usuarios
  get isLogged(): boolean {
    return this._usuariosService.logged;
  }

  get userLogged(): any {
    return this._usuariosService.user;
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
      return;
    }

    if (this.abreTurno) {
      //Si se está abriendo un turno Y el turno anterior fue cerrado
      if (this.turno.hora_cierre) {
        //Se carga un nuevo 'turno' en el formulario con el id del usuario logueado
        this.datosTurno.setValue(new Turno(this.userLogged.usuario_id));
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

    // //Setea el formulario con los valores del objeto 'turno'
    // this.datosTurno.setValue(this.turno);
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

    // this.getUltimoTurno();
  }

  async saveTurno() {
    if (this.abreTurno) {
      this.respuesta = await this._turnosService.inicioTurno(this.datosTurno.value);
    } else {

    }
    
  }
}
