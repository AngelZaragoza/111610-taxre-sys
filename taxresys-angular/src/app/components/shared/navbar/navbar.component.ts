import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ViajesService } from 'src/app/services/viajes.service';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: [],
})
export class NavbarComponent implements OnInit {
  @Input() userLogged: any = { logged: false };
  pendientes: any = 0;
  listaPendientes: any[] = [];

  constructor(
    private _usuariosService: UsuariosService,
    private _viajesService: ViajesService,
    private route: Router
  ) {}

  ngOnInit(): void {
    //Suscribirse al observable de Viajes Pendientes para mostrar la notificación
    this._viajesService.pendientesObs$.subscribe((pend) => {
      this.listaPendientes = pend;
      this.pendientes =
        this.listaPendientes['message'] ==
        'No hay Viajes Pendientes por Asignar'
          ? 0
          : this.listaPendientes.length;
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

  //Recupera datos del servicio de Usuarios
  get isLogged(): boolean {
    return this.userLogged.logged;
  }

  get isOpen(): boolean {
    return this.userLogged.open;
  }

  async logout() {
    let mensaje = `${this.userLogged.alias}: Sesión Cerrada`;
    await this._usuariosService.passportLogout().then(() => {
      this.pendientes = 0;
      Swal.fire({
        title: mensaje,
        icon: 'info',
        position: 'center',
        toast: true,
        timer: 3500,
        timerProgressBar: true,
        showConfirmButton: false,
        didOpen: () => {
          this.route.navigateByUrl('/home');
        },
      });
    });
  }
}
