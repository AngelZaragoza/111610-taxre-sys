import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { MovilesService } from '../../services/moviles.service';
// import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Movil } from '../../classes/movil';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-movil-nuevo',
  templateUrl: './movil-nuevo.component.html',
  styles: [],
})
export class MovilNuevoComponent implements OnInit {
  //Clases modelo para los objetos
  detalle: any = {};
  movil: Movil = new Movil();

  //Listo para guardar nuevo Movil
  ready: boolean;
  nuevo: boolean;

  constructor(private _movilesService: MovilesService, private route: Router) {
    //Listo para guardar nuevo Movil: false
    this.ready = false;
    this.nuevo = false;
  }

  ngOnInit(): void {}

  listenMovil(movil: Movil) {
    //Recibe el objeto "movil" desde el evento del componente hijo
    this.movil = movil;

    //Listo para guardar nuevo Móvil: true
    this.ready = true;
    this.saveMovil();
  }

  async saveMovil() {
    let result = await this._movilesService.nuevoMovilFull(this.movil);

    if (result instanceof HttpErrorResponse) {
      alert(
        `Algo falló:\n${result.error.err?.code} \n ${result.statusText}\nNo se guardaron datos.`
      );
    } else {
      alert(`Nuevo Móvil guardado!`);      
      this.route.navigateByUrl('/home');
    }
  }
}
