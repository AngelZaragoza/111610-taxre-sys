import { Component, DoCheck, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Movil } from '../../classes/movil';
import { MovilesService } from 'src/app/services/moviles.service';
// import { Adherente } from '../../classes/adherente';
// import { AdherentesService } from '../../services/adherentes.service';

@Component({
  selector: 'app-movil-editar',
  templateUrl: './movil-editar.component.html',
  styles: [],
})
export class MovilEditarComponent implements OnInit {
  idParam: any;
  editar: boolean;
  movil: Movil = new Movil();

  constructor(
    private _movilesService: MovilesService,
    private activatedRoute: ActivatedRoute,
    private route: Router
  ) {
    //Se ejecuta con cada llamada a la ruta que renderiza este componente
    //excepto cuando el parámetro que viene con la ruta no cambia.
    //Setea "editar" en falso para evitar ediciones accidentales.
    this.activatedRoute.params.subscribe((params) => {
      this.idParam = params['movil_id'];
      this.detalleMovil(this.idParam).finally(() => console.table(this.movil));

      this.editar = false;
    });
  }

  ngOnInit(): void {}

  async detalleMovil(id) {
    this.movil = await this._movilesService.detalleMovil(id);

    // for (let field in this.detalle) {
    //   //Toma los campos del detalle y los divide en sus respectivos objetos
    //   if (this.usuario[field] !== undefined)
    //     this.usuario[field] = this.detalle[field];
    //   if (this.persona[field] !== undefined)
    //     this.persona[field] = this.detalle[field];
    // }
  }

  activarEdicion(): void {
    this.editar = !this.editar;
  }

  listenMovil(movil: Movil): void {
    //Recibe el objeto "movil" desde el evento del componente hijo
    this.movil = movil;
    this.activarEdicion();
    console.table(this.movil);
    this.updateMovil();
  }

  async updateMovil() {
    console.log('Llegó al update');
    
    let result = await this._movilesService.updateMovil(
      this.movil,
      this.movil.movil_id
    );
    if (result['success']) {
      alert(`Cambios guardados!: ${result['resp']['info']}`);
      this.route.navigateByUrl('/moviles');
    } else {
      alert(`Algo falló`);
    }
    
  }
}
