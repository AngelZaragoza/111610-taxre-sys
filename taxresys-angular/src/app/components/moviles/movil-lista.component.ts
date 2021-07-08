import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MovilesService } from 'src/app/services/moviles.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-movil-lista',
  templateUrl: './movil-lista.component.html',
  styles: [],
})
export class MovilListaComponent implements OnInit {
  lista: any[] = [];
  errorMessage: string = '';
  loading: boolean;

  constructor(
    private _movilesService: MovilesService,
    private _usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.getMoviles();
  }

  async getMoviles() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'movil_lista');
    this.lista = await this._movilesService.getLista('/moviles');
    if (this.lista[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.lista[0]['error']['message'];
    }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'movil_lista');
  }
}
