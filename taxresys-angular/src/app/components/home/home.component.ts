import { Component, DoCheck } from '@angular/core';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements DoCheck {

  saludo:string;

  constructor( private _usuariosService: UsuariosService ) { }

  ngDoCheck(): void {    
    if(!this._usuariosService.user.logged) {
      this.saludo = "Para comenzar debe loguearse";
    } else {
      this.saludo = `Bienvenid@ ${this._usuariosService.user.alias}`;
    }
  }

}
