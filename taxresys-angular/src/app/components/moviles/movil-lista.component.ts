import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MovilesService } from 'src/app/services/moviles.service';

@Component({
  selector: 'app-movil-lista',
  templateUrl: './movil-lista.component.html',
  styles: [
  ]
})
export class MovilListaComponent implements OnInit {
  lista:any[] = [];
  errorMessage: string = '';
  loading: boolean;


  constructor( private _movilesService: MovilesService ) { }

  ngOnInit(): void {
    this.getMoviles();
  }

  async getMoviles() {
    this.loading = true;
    this.lista = await this._movilesService.getLista('/moviles');
    if(this.lista[0] instanceof HttpErrorResponse) {
      this.errorMessage = this.lista[0]['error']['message'];
    }
    this.loading = false;    
  }
}
