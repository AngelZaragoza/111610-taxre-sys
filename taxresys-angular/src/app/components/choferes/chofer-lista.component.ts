import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ChoferesService } from 'src/app/services/choferes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-chofer-lista',
  templateUrl: './chofer-lista.component.html',
  styles: [
  ]
})
export class ChoferListaComponent implements OnInit {
  lista: any[] = [];
  loading: boolean;
  errorMessage: string = '';

  constructor( private _choferesService: ChoferesService, private _usuariosService: UsuariosService ) {}

  ngOnInit(): void {
    this.getChoferes();
  }

  async getChoferes() {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'chofer_lista');
    this.lista = await this._choferesService.getChoferes();
    if(this.lista[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.lista[0]['error']['message'];
    }
    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'chofer_lista');
  }

  desdeOutlet(event?: any) {
    console.log('Evento recibido:', event)
  }

}
