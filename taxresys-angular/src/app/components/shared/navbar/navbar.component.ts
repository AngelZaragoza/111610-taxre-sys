import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertasService } from 'src/app/services/alertas.service';
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
  listaPendientes: any[] = [];

  constructor(
    private _usuariosService: UsuariosService,
    private _viajesService: ViajesService,
    private _alertas: AlertasService,
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
    });

    //Suscribirse al observable de Usuarios logueados para cargar listados
    this._usuariosService.userObs$.subscribe((userLogged) => {
      this.userLogged = userLogged;
      if (this.userLogged.logged) {
        //Si hay un usuario logueado,se recuperan los Pendientes activos
        this._viajesService.getPendientesActivos();
        //Cargar las listas básicas para no hacer llamadas innecesarias a la BD
        // if (!this._viajesService.isIniciado) {
        //   this._viajesService.cargarListas();
        // }
      }
    });
  }

  //Métodos accesores en general
  //****************************
  get isLogged(): boolean {
    return this.userLogged.logged;
  }

  get isOpen(): boolean {
    return this.userLogged.open;
  }

  //Métodos del componente
  //**********************
  confirmaLogout() {
    this._alertas.confirmDialog
      .fire({
        title: `¿Desea Cerrar la Sesión?`,
        text: `${this.userLogged.alias}`,
        icon: 'question',
        position: 'top-end',
        toast: true,        
      })
      .then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, se invoca el método para cerrar sesión
          this.logOut();
        }
      });
  }

  async logOut() {
    try {
      let mensaje = `${this.userLogged.alias}: `;
      let result = await this._usuariosService.passportLogout();
      if (result['status'] === 200) {
        mensaje += result['message'];
        this.pendientes = 0;
        this._alertas.infoDialog.fire({
          title: mensaje,
          toast: true,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          didOpen: () => {
            this.route.navigateByUrl('/home');
          },
        });
      }
    } catch (error) {
      console.error('Logout Error =>', error);
      this._alertas.problemDialog.fire({
        title: error['error'].message,
        position: 'top',
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  }
}
