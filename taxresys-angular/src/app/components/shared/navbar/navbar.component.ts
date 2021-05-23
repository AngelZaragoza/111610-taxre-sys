import { Component, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: [],
})
export class NavbarComponent implements DoCheck {
  
  logged = false;
  user = {};

  constructor(private _usuariosService: UsuariosService, private route: Router) { }

  ngDoCheck(): void {
    this.logged = this._usuariosService.checkAuth();
    if (this.logged) {
      this.user = this._usuariosService.user;
      console.log('Logueado: ', this.logged);
    }
  }

  logout() {
    this._usuariosService.passportLogout();
    this.route.navigateByUrl('/home');    
  }
}
