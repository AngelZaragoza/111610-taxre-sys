import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
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
  loading: boolean;
  errorMessage: string = '';
  nombreComponente: string;
  ultimoOrden: string;
  clickedElem: HTMLElement;

  constructor(
    public _utils: UtilsService,
    private _movilesService: MovilesService,
    private _usuariosService: UsuariosService,
    private _configTip: NgbTooltipConfig,
    private router: Router
  ) {
    this.errorMessage = '';
    this.nombreComponente = 'mov_lista';
    this.ultimoOrden = '';

    // Configuración de los Tooltips
    this._configTip.container = 'body';
    this._configTip.openDelay = 700;
    this._configTip.closeDelay = 200;

    // Verifica los cambios en las rutas. Al cargar la ruta del listado,
    // hace scroll hasta el elemento html guardado (si existe)
    this.router.events
      .pipe(
        takeUntil(this._utils.componentDestroyed$),
        filter((e: RouterEvent) => e instanceof NavigationEnd)
      )
      .subscribe((e: NavigationEnd) => {
        if (e.urlAfterRedirects === '/moviles' && this.clickedElem) {
          this.clickedElem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      });
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
  /**
   * Guarda el elemento html sobre el que se llamó el evento
   */
  public savePosition(elem: Event) {
    this.clickedElem = <HTMLElement>elem.target;
  }

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

  /**
   * Se suscribe a los cambios en cualquier elemento de la lista
   * hasta que el componente sea destruido
   */
  listenUpdates(): void {
    this._movilesService.movilesObs$
      .pipe(takeUntil(this._utils.componentDestroyed$))
      .subscribe((data) => {
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
    // Emite un observable para destruir las suscripciones
    // y luego emite la lista actualizada
    this._utils.componentDestroyed$.next();    
    if (this.lista.length) {
      this._utils.ultimoOrden = '';
      this.ordenarPor('nro_interno');
      this._movilesService.movilesObs$.next(this.lista);
    }
  }
}
