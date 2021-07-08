import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AdherentesService } from 'src/app/services/adherentes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-adherente-lista',
  templateUrl: './adherente-lista.component.html',
  styles: [],
})
export class AdherenteListaComponent implements OnInit {
  lista: any[] = [];
  errorMessage: string = '';
  loading: boolean;

  constructor(
    private _adherentesService: AdherentesService,
    private _usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    //Controlar usuario que realiza solicitud
    this.getAdherentes();
  }

  async getAdherentes() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'adh_lista');
    this.lista = await this._adherentesService.getAdherentes();
    if (this.lista[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.lista[0]['error']['message'];
    }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'adh_lista');
  }
}
