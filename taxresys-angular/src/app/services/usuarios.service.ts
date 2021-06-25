import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  user: any = {};
  roles: any[] = [];
  logged: boolean;
  cookie: string;

  constructor(private _conexion: RequestService) {
    console.log('Usuarios listo');
    this.getRoles().then((res) => {
      this.roles = res;
      console.table(this.roles);
    });
  }

  //Chequea si hay un usuario logueado
  //**********************************
  checkAuth() {
    try {
      let local = localStorage.getItem('user');

      if (local) {
        //Si se recupera data de localStorage, se procede con:
        this.user = JSON.parse(local);

        //Si hay un id en el localStorage, recupera su alias y devuelve true
        if (this.user['usuario_id']) {
          console.log(this.user.alias, this.user.rol_id);
          this.logged = true;
          return true;
        } else {
          this.logged = false;
          return false;
        }
      } else {
        //Si no se recupera nada de localStorage, se procede con:
        localStorage.setItem('user', JSON.stringify({ logged: false }));
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  
  //Métodos de Autenticación
  //************************
  async passportLogin(user: any) {
    console.log(user);
    let result: any;

    await this._conexion.request(
      'POST',
      `${environment.serverUrl}/usuarios/passportLogin`,
      user
    )
      .then((res: any) => {
        console.log(' Respuesta ');
        console.log(res);
        localStorage.setItem('user', JSON.stringify(res));
        result = res;
      })
      .catch((err: any) => {
        console.log(err);
        result = err;
      })
      .finally(() => {
        console.log('Pasa por finally');
        this.checkAuth();
      });

    return result;
  }

  async passportLogout() {
    await this._conexion.request(
      'GET',
      `${environment.serverUrl}/usuarios/passportLogout`
    )
      .then((res: any) => {
        console.log('Respuesta');
        console.log(res);
        localStorage.setItem('user', JSON.stringify(res));
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        this.checkAuth();
      });
  }

  //Métodos de manejo de Usuarios
  //*****************************
  async getUsuarios() {
    let lista: any[] = [];
    await this._conexion.request('GET', `${environment.serverUrl}/usuarios`)
      .then((res: any[]) => {
        lista = res.map((u) => u);
      })
      .catch((err: any) => {
        console.log(err);
      });

    console.log('Lista usuarios:', lista);
    return lista;
  }

  async detalleUsuario(id: Number) {
    let usuario: any;
    await this._conexion.request(
      'GET',
      `${environment.serverUrl}/usuarios/detalle/${id}`
    ).then((res: any) => {
      console.log(res);
      usuario = res;
    });
    return usuario[0];
  }

  async nuevoUsuarioFull(nuevo: any) {
    let user: any;
    await this._conexion.request('POST', `${environment.serverUrl}/usuarios/nuevo`, nuevo)
      .then((res) => (user = res))
      .catch((err) => (user = err));
    return user;
  }

  async updatePersona(persona: any, id: Number) {
    let pers: any;
    await this._conexion.request(
      'PUT',
      `${environment.serverUrl}/usuarios/detalle/${id}`,
      persona
    ).then((res) => (pers = res));
    return pers;
  }

  //Métodos auxiliares
  //*****************************
  async getRoles() {
    let lista: any[] = [];
    await this._conexion.request('GET', `${environment.serverUrl}/usuarios/roles`)
      .then((res: any[]) => {
        lista = res.map((rol) => rol);
      })
      .catch((err: any) => {
        console.log(err);
      });

    return lista;
  }
}
