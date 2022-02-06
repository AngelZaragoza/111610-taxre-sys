import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PreviousRouteService } from 'src/app/services/previous-route.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styles: [
  ]
})
export class ErrorComponent implements OnInit {
  // Atributos que pueden ser seteados desde el componente padre
  @Input() origin: string;
  @Input() errorTitle: string = '';
  @Input() errorMessage: string = '';
  
  // Listas con los nombres de componentes a comparar
  errorListas: string[];
  errorIndividuales: string[];

  constructor(
    private _activated: ActivatedRoute, 
    private _route: Router, 
    private _previous: PreviousRouteService
  ) {
    this.errorListas = [
      'usr_lista',
      'adh_lista',
      'chf_lista',
      'mov_lista',
      'form_turno',
      'jornada_planilla'
    ];
    this.errorIndividuales = [
      'usr_detalle',
      'adh_detalle',
      'chf_detalle',
      'mov_detalle',
      'chf_nuevo',
      'mov_nuevo',
      'abre_cierra_jornada'
    ];
   }

  ngOnInit(): void {
    //Si 'origin' no fue seteado por Input, se lee el queryParam
    if(!this.origin) {
      this._activated.queryParamMap.subscribe(params => {
        this.origin = params.get('origin') ?? '404';
        switch (this.origin) {
          case 'turno-dif-usuario':
            this.errorTitle = 'Turno abierto por otro Usuario';
            this.errorMessage = 'Sólo el Usuario que abrió el Turno actual tiene acceso a la Planilla de Alta de Viajes';
            break;
          case 'turno-viajes-pln':
            this.errorTitle = 'No hay un Turno abierto';
            this.errorMessage = 'Acceso a la Planilla de Alta de Viajes sólo posible luego de abrir Turno';
            break;
          case 'turno-jornadas-pln':
            this.errorTitle = 'No hay un Turno abierto';
            this.errorMessage = 'Iniciar o Cerrar Jornadas de Móviles sólo posible luego de abrir Turno';
            break;
          case 'not-admin':
            this.errorTitle = 'Acceso Restringido';
            this.errorMessage = 'Sólo un Usuario Administrador puede acceder a la ruta solicitada';
            break;
          case 'not-admin-manager':
            this.errorTitle = 'Acceso Restringido';
            this.errorMessage = 'Sólo un Usuario Administrador o Encargado puede acceder a la ruta solicitada';
            break;
          case '404':
            this.errorTitle = '404 Page Not Found';
            this.errorMessage = 'La ruta solicitada no existe. Si la ingresó manualmente, verifique e intente nuevamente';
            break;
        }
      })      
    }
  }

  backToPrevious() {
    let previous = this._previous.getPreviousUrl();
    this._route.navigateByUrl(previous);
  }

  backToParent() {
    let parent = this._previous.getParentUrl();
    this._route.navigateByUrl(parent || '/home');
  }
}
