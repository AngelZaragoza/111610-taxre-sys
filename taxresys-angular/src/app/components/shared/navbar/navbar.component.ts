import { Component, DoCheck, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: [],
})
export class NavbarComponent implements OnInit {  

  constructor(
    private _usuariosService: UsuariosService,
    private route: Router
  ) {    
  }

  ngOnInit(): void {    
    this._usuariosService.checkAuth();
  }
  
  /*  Código anterior
  ++++++++++++++++++++++
  ngDoCheck(): void {
    this.logged = this._usuariosService.checkAuth();
    if (this.logged) {
      this.user = this._usuariosService.user;
      // console.log('Logueado: ', this.logged);
    }    
  }
  */

  //Recupera datos del servicio de Usuarios
  get isLogged(): boolean {
    return this._usuariosService.logged;
  }
  
  get userLogged(): any {
    return this._usuariosService.user;
  }

  logout(): void {
    this._usuariosService.passportLogout();
    this.route.navigateByUrl('/home');
  }
  
}
