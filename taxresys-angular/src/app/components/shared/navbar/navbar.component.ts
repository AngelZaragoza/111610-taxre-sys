import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: [],
})
export class NavbarComponent implements OnInit {
  userLogged: any = {};

  constructor(
    private _usuariosService: UsuariosService,
    private route: Router
  ) {}

  ngOnInit(): void {
    this._usuariosService.userObs$.subscribe((userLogged) => {
      console.log('navbar', userLogged);
      this.userLogged = userLogged;
    });    
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
    return this.userLogged.logged;
  }

  get isOpen(): boolean {
    return this.userLogged.open;
  }

  logout(): void {
    this._usuariosService.passportLogout();
    this.route.navigateByUrl('/home');
  }
}
