import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ViajesService } from 'src/app/services/viajes.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: [],
})
export class NavbarComponent implements OnInit {
  @Input() userLogged: any = { logged: false };
  pendientes: any = 0;

  constructor(
    private _usuariosService: UsuariosService,
    private _viajesService: ViajesService,
    private route: Router
  ) {}

  ngOnInit(): void {
    //Suscribirse al observable de Viajes Pendientes para mostrar la notificación
    this._viajesService.pendientesObs$.subscribe((pend) => {
      this.pendientes = pend;
      console.log('Pend. Navbar =>', this.pendientes);
    });

    //Suscribirse al observable de Usuarios logueados para cargar listados
    this._usuariosService.userObs$.subscribe((userLogged) => {
      this.userLogged = userLogged;
      if (this.userLogged.logged) {
        //Si hay un usuario logueado,se recuperan los Pendientes activos
        this._viajesService.getPendientesActivos();
        //Cargar las listas básicas para no hacer llamadas innecesarias a la BD
        if (!this._viajesService.isIniciado) {
          this._viajesService.cargarListas();
        }
      }
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

  async logout() {
    await this._usuariosService.passportLogout().then(() => {
      this.pendientes = 0;
      this.route.navigateByUrl('/home');
    });
  }
}
