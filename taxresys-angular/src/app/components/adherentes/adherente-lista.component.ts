import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';

import { AdherentesService } from 'src/app/services/adherentes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-adherente-lista',
  templateUrl: './adherente-lista.component.html',
  styles: [],
})
export class AdherenteListaComponent implements OnInit, OnDestroy {
  //Listado
  lista: any[] = [];

  //Información del usuario y turno
  userLogged: any = {};

  //Auxiliares
  loading: boolean;
  errorMessage: string;
  nombreComponente: string;
  clickedElem: HTMLElement;

  constructor(
    private _adherentesService: AdherentesService,
    private _usuariosService: UsuariosService,
    private _utils: UtilsService,
    private router: Router
  ) {
    this.errorMessage = '';
    this.nombreComponente = 'adh_lista';

    // Verifica los cambios en las rutas. Al cargar la ruta del listado,
    // hace scroll hasta el elemento html guardado (si existe)
    this.router.events
      .pipe(
        takeUntil(this._utils.componentDestroyed$),
        filter((e: RouterEvent) => e instanceof NavigationEnd)
      )
      .subscribe((e: NavigationEnd) => {
        if (e.urlAfterRedirects === '/adherentes' && this.clickedElem) {
          this.clickedElem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      });
  }

  ngOnInit(): void {
    this.userLogged = this._usuariosService.user;
    //Controlar usuario que realiza solicitud
    this.getAdherentes();
  }

  //Métodos accessores
  //*******************
  get isAdmin(): boolean {
    return this.userLogged.rol_id == 1;
  }

  get isManager(): boolean {
    return this.userLogged.rol_id == 2;
  }

  //Métodos del componente
  //*******************
  /**
   * Guarda el elemento html sobre el que se llamó el evento
   */
  public savePosition(elem: Event) {
    this.clickedElem = <HTMLElement>elem.target;
  }

  private async getAdherentes() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);
    this.lista = await this._adherentesService.getAdherentes();

    if (this.lista instanceof HttpErrorResponse) {
      this.errorMessage = this.lista.error['message'];
    } else {
      this.errorMessage = '';
    }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, this.nombreComponente);

    this.listenUpdates();
  }

  /**
   * Se suscribe a los cambios en cualquier elemento de la lista
   * hasta que el componente sea destruido
   */
  private listenUpdates(): void {
    this._usuariosService.personaObs$
      .pipe(takeUntil(this._utils.componentDestroyed$))
      .subscribe((data) => {
        let { action, ...valores } = data;

        // Se chequea la propiedad 'action' del Observable
        switch (action) {
          case 'added':
            this.lista.push(valores['created']);
            break;
          case 'updated':
            let index = this.lista.findIndex(
              (item) => item['persona_id'] == valores['persona_id']
            );
            for (const key in this.lista[index]) {
              if (Object.prototype.hasOwnProperty.call(valores, key)) {
                this.lista[index][key] = valores[key];
              }
            }
            // this.lista = this._listadoService.ordenarListado(this.lista,'apellido', 'asc');
            break;
        }
        this.ordenarPor('apellido');
      });
  }

  public ordenarPor(campo: string): void {
    this._utils.ordenarListado(this.lista, campo);
  }

  ngOnDestroy(): void {
    // Emite un observable para destruir las suscripciones
    this._utils.componentDestroyed$.next();    
    this._adherentesService.adherentesObs$.next(this.lista);
  }
}
