import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styles: [
  ]
})
export class ErrorComponent implements OnInit {
  //Atributos que pueden ser seteados desde el componente padre
  @Input() origin: string;
  @Input() errorTitle: string = '';
  @Input() errorMessage: string = '';

  constructor(private _activated: ActivatedRoute, private _route: Router) { }

  ngOnInit(): void {
    //Si 'origin' no fue seteado por Input, se lee el queryParam
    if(!this.origin) {      
      this._activated.queryParamMap.subscribe(params => {
        this.origin = params.get('origin');
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
          // default:
          //   break;
        }
      })      
    }
  }
}
