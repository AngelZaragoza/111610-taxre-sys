import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Movil } from '../../classes/movil';
import { MovilesService } from 'src/app/services/moviles.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertasService } from 'src/app/services/alertas.service';

@Component({
  selector: 'app-movil-editar',
  templateUrl: './movil-editar.component.html',
  styles: [],
})
export class MovilEditarComponent implements OnInit {
  //Listados
  listaAdherentes: any[] = [];
  listaChoferes: any[] = [];
  listaTipos: any[] = [];

  //Clases modelo para los objetos
  movil: Movil = new Movil();

  //Auxiliares
  idParam: any;
  editar: boolean;
  loading: boolean;
  ready: boolean;
  nuevo: boolean;
  errorMessage: string = '';

  constructor(
    private _movilesService: MovilesService,
    private _usuariosService: UsuariosService,
    private activatedRoute: ActivatedRoute,
    private _alertas: AlertasService
  ) {
    this.nuevo = false;
    //Se ejecuta con cada llamada a la ruta que renderiza este componente
    //excepto cuando el parámetro que viene con la ruta no cambia.
    //Setea "editar" en falso para evitar ediciones accidentales.
    this.activatedRoute.params.subscribe((params) => {
      this.idParam = params['movil_id'];
      this.editar = false;

      this.detalleMovil(this.idParam).finally(() => {
        console.table(this.movil);
      });
    });
  }

  ngOnInit(): void {
    this.getDatosCombos();
  }

  //Métodos accesores en general
  //****************************
  get isAdmin(): boolean {
    return this._usuariosService.user['rol_id'] === 1;
  }

  get isManager(): boolean {
    return this._usuariosService.user['rol_id'] == 2;
  }

  //Métodos del componente
  //**********************
  async getDatosCombos() {
    //Controlar como se ve si no hay adherentes cargados...
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
      this.ready = false;
    }

    /*
    this.listaAdherentes = await this._movilesService.getLista('/adherentes');

    //Si no hay adherentes cargados, no se hacen los otros llamados
    if (this.listaAdherentes[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.listaAdherentes[0]['error']['message'];
      this.ready = false;
    } else {
      this.listaChoferes = await this._movilesService.getLista('/choferes');
      this.listaTipos = await this._movilesService.getLista('/moviles/tipos');
    }
    */
  }

  async detalleMovil(id) {
    this.loading = true;
    this.ready = false;
    this._usuariosService.mostrarSpinner(this.loading, 'movil_detalle');

    try {
      this.movil = await this._movilesService.detalleMovil(id);
      this.ready = true;
      this.errorMessage = '';
    } catch (error) {
      this.ready = false;
      this.errorMessage = error.error?.message;
    }

    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'movil_detalle');
  }

  activarEdicion(): void {
    this.editar = !this.editar;
  }

  listenMovil(movil: Movil): void {
    //Recibe el objeto "movil" desde el evento del componente hijo
    this.movil = movil;
    this.updateMovil();
  }

  async updateMovil() {
    this.loading = true;
    let mensaje: string;
    let result: any;

    try {
      result = await this._movilesService.updateMovil(
        this.movil,
        this.movil.movil_id
      );
    } catch (error) {
      result = error;
    }

    if (result instanceof HttpErrorResponse) {
      mensaje = `${result['error']['message']} -- ${result['statusText']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: 'Algo falló',
        text: mensaje,
      });
    } else {
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Cambios guardados!',
        text: 'Espere...',
        didOpen: () => {
          this.activarEdicion();
        },
      });
    }

    this.loading = false;
  }
}
