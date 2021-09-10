import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  //Auxiliares
  user: any = {};
  userObs$: Subject<any>;
  personaObs$: Subject<any>;
  turno: any;
  roles: any[] = [];

  constructor(
    private _conexion: RequestService,
    private _spinner: NgxSpinnerService
  ) {
    //Instancia los objetos que serán retornados como Observables
    this.userObs$ = new Subject();
    this.personaObs$ = new Subject();

    console.log('Usuarios listo');
  }

  //Chequea si hay un usuario logueado
  //**********************************
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
    try {
      let result = await this._conexion.request(
        'POST',
        `${environment.serverUrl}/usuarios/passportLogin`,
        user
      );

      this.checkAuth(false, result);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async passportLogout() {
    try {
      let result = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/usuarios/passportLogout`
      );

      this.turno = {};
      this.checkAuth(false, result);
      return result;
    } catch (error) {
      throw error;
    }
  }

  //Métodos de manejo de Usuarios
  //*****************************
  async getUsuarios() {
    try {
      let lista = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/usuarios`
      );
      return lista;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async detalleUsuario(id: Number) {
    try {
      let usuario = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/usuarios/detalle/${id}`
      );
      return usuario[0];
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async nuevoUsuarioFull(nuevo: any) {
    try {
      let usuario = await this._conexion.request(
        'POST',
        `${environment.serverUrl}/usuarios`,
        nuevo
      );
      //Se emiten los datos mediante el Observable para actualizar la lista
      this.personaObs$.next(usuario);

      return usuario;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async updatePersona(origen: string, persona: any, id: Number) {
    try {
      let result: any = await this._conexion.request(
        'PUT',
        `${environment.serverUrl}${origen}/detalle/${id}`,
        persona
      );

      //Se emiten los datos básicos para actualizar listas
      let { apellido, nombre, persona_id } = persona;
      let { action } = result;
      this.personaObs$.next({
        apellido,
        nombre,
        persona_id,
        action,
      });

      return result;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async updateUsuario(usuario: any, id: Number) {
    try {
      let result: any = await this._conexion.request(
        'PATCH',
        `${environment.serverUrl}/usuarios/detalle/${id}`,
        usuario
      );

      //Se emiten los datos básicos para actualizar listas
      let { alias, rol_id, persona_id } = usuario;
      let { action } = result;

      this.personaObs$.next({ alias, rol_id, persona_id, action });
      return result;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  //Métodos auxiliares
  //*****************************
  async getRoles() {
    try {
      const lista = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/usuarios/roles`
      );
      this.roles = <any[]>lista;
      return lista;
    } catch (error) {
      console.error('No se pudieron recuperar roles', error);
    }
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

  // Reemplazar por la nueva función en Viajes e Histórico
  calcularFechaMaxima(fechaInicio: Date, horasSumadas: number): Date {
    let fechaMaxima = new Date(
      fechaInicio.valueOf() + 1000 * 60 * 60 * horasSumadas
    );
    return fechaMaxima;
  }

  calculaFechaMax(fechaBase: Date, unidad: string, valor: number): Date {
    let totalMilisegundos = 1000 * 60 * 60;
    switch (unidad) {
      case 'h':
        totalMilisegundos *= valor;
        break;
      case 'd':
        totalMilisegundos *= valor * 24;
        break;
      case 'm':
        totalMilisegundos *= valor * 30 * 24;
        break;
      case 'y':
        totalMilisegundos *= valor * 365 * 24;
    }

    let fechaMaxima = new Date(fechaBase.getTime() + totalMilisegundos);
    return fechaMaxima;
  }
}
