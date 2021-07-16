import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MovilesService } from 'src/app/services/moviles.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-jornada-planilla',
  templateUrl: './jornada-planilla.component.html',
  styleUrls: ['./jornada-planilla.component.css'],
})
export class JornadaPlanillaComponent implements OnInit {
  listaMovilesJornadas: any[] = [];
  listaChoferes: any[] = [];
  formAbierto: boolean = false;
  errorMessage: string;
  loading: boolean;
  turnoActual: number;

  constructor(
    private _usuariosService: UsuariosService,
    private _movilesService: MovilesService
  ) {}

  ngOnInit(): void {
    //Recupera el turno actualmente abierto
    this.turnoActual = this._usuariosService.user['open']
      ? this._usuariosService.user['turno_id']
      : -1;
    console.log(`Turno actual: ${this.turnoActual}`);
    this.getListas();
  }

  async getListas() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'jornada_planilla');

    //Controlar como se ve si no hay datos cargados...
    this.listaMovilesJornadas = await this._movilesService.getLista(
      '/jornadas'
    );

    //Si no hay móviles cargados, no se hacen los otros llamados
    if (this.listaMovilesJornadas[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.listaMovilesJornadas[0]['error']['message'];
    } else {
      this.listaChoferes = await this._movilesService.getLista('/choferes');
    }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'jornada_planilla');
  }

  abiertoForm(event: any): void {
    console.log('Outlet activado', event);
    this.formAbierto = true;
  }
  
  cerradoForm(event: any): void {
    console.log('Outlet desactivado', event);
    if(event['ready']) {
      //Si la propiedad ready desde el event es true, se actualiza la lista
      this.getListas();
    }
    this.formAbierto = false;
  }
}
