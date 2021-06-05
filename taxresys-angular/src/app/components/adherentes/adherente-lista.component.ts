import { Component, OnInit } from '@angular/core';
import { AdherentesService } from 'src/app/services/adherentes.service';

@Component({
  selector: 'app-adherente-lista',
  templateUrl: './adherente-lista.component.html',
  styles: [],
})
export class AdherenteListaComponent implements OnInit {
  lista: any[] = [];
  loading: boolean;

  constructor(private _adherentesService: AdherentesService) {}

  ngOnInit(): void {
    //Controlar usuario que realiza solicitud
    this.getUsuarios();    
  }

  async getUsuarios() {
    this.loading = true;
    this.lista = await this._adherentesService.getAdherentes();
    this.loading = false;    
  }
}
