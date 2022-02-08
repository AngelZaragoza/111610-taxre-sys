import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { JornadasService } from 'src/app/services/jornadas.service';
import { ChoferesService } from 'src/app/services/choferes.service';

@Component({
  selector: 'app-jornada-planilla',
  templateUrl: './jornada-planilla.component.html',
})
export class JornadaPlanillaComponent implements OnInit {
  listaMovilesJornadas: any[] = [];
  listaChoferes: any[] = [];
  nombreComponente: string;
  formAbierto: boolean = false;
  errorMessage: string;
  loading: boolean;
  turnoActual: number;

  constructor(
    private _usuariosService: UsuariosService,
    private _choferesService: ChoferesService,
    private _jornadasService: JornadasService
  ) {
    this.errorMessage = '';
    this.nombreComponente = 'jornada_planilla';
  }

  ngOnInit(): void {
    //Recupera el turno actualmente abierto
    this.turnoActual = this._usuariosService.user['open']
      ? this._usuariosService.user['turno_id']
      : -1;
    
    this.getListas();
    
  }

  async getListas() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);

    this.listaMovilesJornadas = await this._jornadasService.getMovilesJornadas();
    
    // Si no hay Móviles o Choferes cargados, se recupera el mensaje de error    
    if (this.listaMovilesJornadas instanceof HttpErrorResponse) {
      this.errorMessage = this.listaMovilesJornadas.error['message'];
    } else {
      this.listaChoferes = await this._choferesService.getChoferes();
      if (this.listaChoferes instanceof HttpErrorResponse) {
        this.errorMessage = this.listaChoferes.error['message'];
      }
    }
    
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);
  }

  abiertoForm(event: any): void {
    this.formAbierto = true;
  }

  cerradoForm(event: any): void {
    // Si la propiedad 'ready' desde el event es true, se actualiza la lista
    if (event['ready']) {
      this.getListas();
    }
    this.formAbierto = false;
  }
}
