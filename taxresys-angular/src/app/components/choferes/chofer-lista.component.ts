import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ChoferesService } from 'src/app/services/choferes.service';

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

  constructor( private _choferesService: ChoferesService ) {}

  ngOnInit(): void {
    this.getChoferes();
  }

  async getChoferes() {
    this.loading = true;
    this.lista = await this._choferesService.getChoferes();
    if(this.lista[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.lista[0]['error']['message'];
    }
    this.loading = false;    
  }

}
