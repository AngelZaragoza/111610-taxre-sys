import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  user: any = {};
  userObs$: Subject<any>;
  turno: any;
  roles: any[] = [];

  constructor(
    private _conexion: RequestService,
    private _spinner: NgxSpinnerService
  ) {
    console.log('Usuarios listo');
    // console.log('Roles => ', this.roles, this.roles.length);

    //Instancia el objeto que será retornado como Observable
    this.userObs$ = new Subject();
    //Chequea contra el servidor que haya un usuario logueado
    this.checkAuth(true);
  }

  //Chequea si hay un usuario logueado
  //**********************************
  // checkAuth() {
  //   try {
  //     let local = localStorage.getItem('user');

  //     if (local) {
  //       //Si se recupera data de localStorage, se procede con:
  //       this.user = JSON.parse(local);

  //       //Si hay un id en el localStorage, recupera su alias y devuelve true
  //       if (this.user['usuario_id']) {
  //         console.log(this.user.alias, this.user.rol_id);
  //         this.logged = true;
  //         return true;
  //       } else {
  //         this.logged = false;
  //         return false;
  //       }
  //     } else {
  //       //Si no se recupera nada de localStorage, se procede con:
  //       localStorage.setItem('user', JSON.stringify({ logged: false }));
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return false;
  //   }
  // }

  async checkAuth(chkServer: boolean, passportResult?: any) {
    try {
      if (passportResult) {
        //Si se recibe un objeto, la llamada vino desde el LogIn o el LogOut:
        //Se escribe en localStorage y se recuperan los roles de usuario

        if (passportResult.logged) {
          await this.getTurnoAbierto();
          await this.getRoles();
        }
        this.user = { ...passportResult, ...this.turno };
        localStorage.setItem('user', JSON.stringify(this.user));
        return this.user;
      }

      if (chkServer) {
        //Se chequea desde la sesión almacenada en server
        //y se recuperan los roles de usuario
        let result: Object = await this._conexion.request(
          'GET',
          `${environment.serverUrl}/usuarios/isauth`
        );
        await this.getTurnoAbierto();

        this.user = { ...result, ...this.turno };
        localStorage.setItem('user', JSON.stringify(this.user));
        this.getRoles();
        return this.user;
      }

      //Se recupera data de localStorage, se procede con:
      this.user = JSON.parse(localStorage.getItem('user'));
      return this.user;
    } catch (error) {
      console.log(error);
      localStorage.setItem('user', JSON.stringify(error['error']));
      this.user = JSON.parse(localStorage.getItem('user'));
      return this.user;
    } finally {
      this.userObs$.next(this.user);
    }
  }

  //Métodos de Autenticación
  //************************
  async passportLogin(user: any) {
    // console.log(user);
    let result: any;

    await this._conexion
      .request('POST', `${environment.serverUrl}/usuarios/passportLogin`, user)
      .then((res: any) => {
        console.log('Resp. Login =>', res);
        // localStorage.setItem('user', JSON.stringify(res));
        result = res;
      })
      .catch((err: any) => {
        console.log(err);
        result = err;
      })
      .finally(() => {
        // console.log('Pasa por finally');
        this.checkAuth(false, result);
      });

    return result;
  }

  async passportLogout() {
    let result: any;
    await this._conexion
      .request('GET', `${environment.serverUrl}/usuarios/passportLogout`)
      .then((res: any) => {
        // console.log('Then. Logout => ', res);
        result = res;
        // localStorage.setItem('user', JSON.stringify(res));
      })
      .catch((err: any) => {
        result = err;
        console.log(err);
      });
      // .finally(() => {
      //   console.log('Finally. Logout => ', result);
      //   this.checkAuth(false, result);
      // });

    this.turno = {};
    this.checkAuth(false, result);

    return result;
  }

  //Métodos de manejo de Usuarios
  //*****************************
  async getUsuarios() {
    let lista: any[] = [];
    await this._conexion
      .request('GET', `${environment.serverUrl}/usuarios`)
      .then((res: any[]) => {
        lista = res.map((u) => u);
      })
      .catch((err: any) => {
        lista = err;
        console.log(err);
      });
    return lista;
  }

  async detalleUsuario(id: Number) {
    let usuario: any;
    await this._conexion
      .request('GET', `${environment.serverUrl}/usuarios/detalle/${id}`)
      .then((res: any) => {
        // console.log(res);
        usuario = res;
      })
      .catch((err) => {
        usuario = err;
      });
    return usuario[0];
  }

  async nuevoUsuarioFull(nuevo: any) {
    let usuario: any;
    await this._conexion
      .request('POST', `${environment.serverUrl}/usuarios/nuevo`, nuevo)
      .then((res) => (usuario = res))
      .catch((err) => (usuario = err));
    return usuario;
  }

  async updatePersona(persona: any, id: Number) {
    let pers: any;
    await this._conexion
      .request(
        'PUT',
        `${environment.serverUrl}/usuarios/detalle/${id}`,
        persona
      )
      .then((res) => (pers = res));
    return pers;
  }

  //Métodos auxiliares
  //*****************************
  async getRoles() {
    let lista: any[] = [];
    await this._conexion
      .request('GET', `${environment.serverUrl}/usuarios/roles`)
      .then((res: any[]) => {
        lista = res.map((rol) => rol);
      })
      .catch((err: any) => {
        lista = err;
        console.log(err);
      })
      .finally(() => {
        this.roles = lista;
      });

    return lista;
  }

  async getTurnoAbierto() {
    let turno: any;
    await this._conexion
      .request('GET', `${environment.serverUrl}/turnos/inout`)
      .then((res: any) => {
        console.log('Desde chequeo ultimo turno =>', res);
        console.log('cierre =>', res['turno'].hora_cierre);
        if (res['turno'].hora_cierre) {
          turno['open'] = false;
        } else {
          turno = {
            open: true,
            turno_id: res['turno'].turno_id,
            hora_inicio: res['turno'].hora_inicio,
            owner: res['turno'].usuario_id,
          };
        }
        this.turno = turno;
      })
      .catch((err) => {
        this.turno = { open: false };
        turno = err;
      });
    return turno;
  }

  mostrarSpinner(loading: boolean, name: string): void {
    if (loading) {
      this._spinner.show(name);
    } else {
      setTimeout(() => {
        this._spinner.hide(name);
      }, 500);
    }
  }

  calcularFechaMaxima(fechaInicio: Date, horasSumadas: number): Date {
    let fechaMaxima = new Date(
      fechaInicio.valueOf() + 1000 * 60 * 60 * horasSumadas
    );
    return fechaMaxima;
  }
}
