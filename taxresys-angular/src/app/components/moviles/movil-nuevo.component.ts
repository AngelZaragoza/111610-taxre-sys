import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MovilesService } from '../../services/moviles.service';
import { Movil } from '../../classes/movil';
import { AlertasService } from 'src/app/services/alertas.service';

@Component({
  selector: 'app-movil-nuevo',
  templateUrl: './movil-nuevo.component.html',
  styles: [],
})
export class MovilNuevoComponent implements OnInit {
  // Listados
  listaAdherentes: any[] = [];
  listaChoferes: any[] = [];
  listaTipos: any[] = [];

  // Clases modelo para los objetos
  detalle: any = {};
  movil: Movil = new Movil();

  // Listo para guardar nuevo Movil
  ready: boolean;
  nuevo: boolean;
  loading: boolean;
  errorMessage: string = '';

  constructor(
    private _movilesService: MovilesService,
    private _alertas: AlertasService,
    private route: Router
  ) {
    //Listo para guardar nuevo Movil: false
    this.ready = false;
    this.nuevo = true;
  }

  ngOnInit(): void {
    this.getDatosCombos();
  }

  async getDatosCombos() {
    try {
      if (!this._movilesService.iniciado) {
        await this._movilesService.cargarListas();
      }
      this.listaAdherentes = this._movilesService.listaAdherentes;
      this.listaChoferes = this._movilesService.listaChoferes;
      this.listaTipos = this._movilesService.listaTipos;
      this.ready = true;
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = error.error?.message;
    }

    // Se muestra el componente de error si no hay Adherentes cargados
    if (!this.listaAdherentes.length) {
      this.ready = false;
      this.errorMessage =
        'No se puede dar de alta un Móvil sin Adherentes cargados';
    }
  }

  listenMovil(movil: Movil) {
    //Recibe el objeto "movil" desde el evento del componente hijo
    this.movil = movil;

    //Listo para guardar nuevo Móvil: true
    this.ready = true;
    this.saveMovil();
  }

  async saveMovil() {
    this.loading = true;
    let mensaje: string;
    let result: any;

    result = await this._movilesService.nuevoMovilFull(this.movil);

    if (result instanceof HttpErrorResponse) {
      mensaje = `${result.error['message']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: `Algo falló (${result.error['status']})`,
        text: mensaje,
      });
    } else {
      mensaje = `Nuevo Móvil Creado. Espere...`;
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Móvil guardado!',
        text: mensaje,
        didOpen: () => {
          this.route.navigateByUrl('/moviles');
        },
      });
    }

    this.loading = false;
  }
}
