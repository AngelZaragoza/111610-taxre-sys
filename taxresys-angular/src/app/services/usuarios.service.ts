import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReplaySubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  // Auxiliares
  user: any = {};
  userObs$: ReplaySubject<any>;
  personaObs$: Subject<any>;
  turno: any;
  roles: any[] = [];

  constructor(
    private _conexion: RequestService,
    private _spinner: NgxSpinnerService
  ) {
    // Instancia los objetos que serán retornados como Observables
    this.userObs$ = new ReplaySubject(1);
    this.personaObs$ = new Subject();

    this.user = this.readUser();
    console.log('Usuarios listo');
  }

  //Chequea si hay un usuario logueado
  //**********************************
  public async checkAuth() {
    try {
      const passportResult: Object = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/usuarios/isauth`
      );
      this.setUser(passportResult);
    } catch (error) {
      console.error(error);
      this.setUser(error.error);
    }
  }

  // Métodos de Autenticación
  // ************************
  /**
   * Si un Usuario hace login, recupera el último turno y los roles,
   * luego almacena en localStorage los datos del Usuario.
   */
  public async setUser(user: any) {
    if (user.logged) {
      await Promise.all([this.getTurnoAbierto(), this.getRoles()])
        .then((results) => {
          [this.turno, this.roles] = results;
        })
        .catch((error) => {
          console.error(error);
        });      
    } else {
      this.turno = {};
    }
    this.user = { ...user, ...this.turno };
    localStorage.setItem('user', JSON.stringify(this.user));
    this.userObs$.next(this.user);
  }

  /**
   * Intenta leer desde localStorage los datos del Usuario.
   * Si no encuentra uno, devuelve un objeto 'not logged'.
   */
  public readUser() {
    try {
      return (
        JSON.parse(localStorage.getItem('user')) ?? {
          logged: false,
          message: 'Sesión Cerrada',
        }
      );
    } catch (error) {
      return { logged: false, message: 'Sesión Cerrada' };
    }
  }

  async passportLogin(user: any) {
    try {
      let passportResult: {} = await this._conexion.request(
        'POST',
        `${environment.serverUrl}/usuarios/passportLogin`,
        user
      );
      this.setUser(passportResult);
      return passportResult;
    } catch (error) {
      throw error;
    }
  }

  async passportLogout() {
    try {
      let passportResult: {} = await this._conexion.request(
        'GET',
        `${environment.serverUrl}/usuarios/passportLogout`
      );
      this.setUser(passportResult);
      return passportResult;
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
      return <any[]>lista;
    } catch (error) {
      console.error('No se pudieron recuperar roles', error);
    }
  }

  async getTurnoAbierto() {
    let turno: any;
    await this._conexion
      .request('GET', `${environment.serverUrl}/turnos/inout`)
      .then((res: any) => {        
        if (res['turno'].hora_cierre) {
          turno = { open: false };
        } else {
          turno = {
            open: true,
            turno_id: res['turno'].turno_id,
            hora_inicio: res['turno'].hora_inicio,
            owner: res['turno'].usuario_id,
          };
        }
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
