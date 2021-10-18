import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { MovilesService } from 'src/app/services/moviles.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-movil-lista',
  templateUrl: './movil-lista.component.html',
  styles: [],
})
export class MovilListaComponent implements OnInit, OnDestroy {
  //Listado
  lista: any[] = [];

  //Información del usuario y turno
  // userLogged: any = {};

  //Auxiliares
  movilSub: Subscription;
  loading: boolean;
  errorMessage: string = '';
  nombreComponente: string;
  ultimoOrden: string;

  constructor(
    private _movilesService: MovilesService,
    private _usuariosService: UsuariosService,
    private _configTip: NgbTooltipConfig,
    private _utils: UtilsService
  ) {
    this.errorMessage = '';
    this.nombreComponente = 'mov_lista';
    this.ultimoOrden = '';

    // Configuración de los Tooltips
    this._configTip.container = 'body';
    this._configTip.openDelay = 700;
    this._configTip.closeDelay = 200;
  }

  ngOnInit(): void {
    //Controlar usuario que realiza solicitud
    this.getMoviles();
  }

  //Métodos accessores
  //*******************
  get isAdmin(): boolean {
    return this._usuariosService.user['rol_id'] === 1;
  }

  get isManager(): boolean {
    return this._usuariosService.user['rol_id'] === 2;
  }

  //Métodos del componente
  //*******************
  async getMoviles() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);
    this.lista = await this._movilesService.getLista('/moviles');

    if (this.lista instanceof HttpErrorResponse) {
      this.errorMessage = this.lista.error['message'];
    } else {
      this.errorMessage = '';
    }

    this.listenUpdates();
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);
  }

  /** Se suscribe a los cambios en la lista de Móviles */
  listenUpdates(): void {
    this.movilSub = this._movilesService.movilesObs$.subscribe((data) => {
      if (Array.isArray(data)) {
        this.lista = data;
        return;
      }
      let {
        action,
        resp: { ...valores },
      } = data;
      console.log('Valores =>', valores);
      switch (action) {
        case 'added':
          this.lista.push(valores);
          break;
        case 'updated':
          let index = this.lista.findIndex(
            (item) => item['movil_id'] == valores['movil_id']
          );
          for (const key in this.lista[index]) {
            if (Object.prototype.hasOwnProperty.call(valores, key)) {
              this.lista[index][key] = valores[key];
            }
          }
          break;
      }
      this.ordenarPor('nro_interno');
    });
  }

  ordenarPor(campo: string): void {
    this._utils.ordenarListado(this.lista, campo);
  }

  ngOnDestroy(): void {
    //Destruye la suscripción
    if (this.movilSub) {
      this.movilSub.unsubscribe();
    }
    if (this.lista.length) {
      this._utils.ultimoOrden = '';
      this.ordenarPor('nro_interno');
      this._movilesService.movilesObs$.next(this.lista);
    }
  }
}
