import { Component, OnInit, DoCheck} from '@angular/core';

import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: [],
})
export class NavbarComponent implements DoCheck {
  // @Input() logged: boolean = false;
  // @Input() username: string;
  
  logged = false;
  user = {};

  constructor(private _usuariosService: UsuariosService) {}

  ngDoCheck(): void {    
    this.logged = this._usuariosService.checkAuth();
    if (this.logged) {
      this.user = this._usuariosService.user;
      console.log('Logueado: ', this.logged);
    }
  }

  logout() {
    this._usuariosService.passportLogout();
    this._usuariosService.checkAuth();
  }
}
