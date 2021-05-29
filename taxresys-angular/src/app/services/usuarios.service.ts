import { Injectable } from '@angular/core';
import { HttpClient, HttpXsrfTokenExtractor } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DTODetalleUsuario } from '../classes/detalle-usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  user: any = {};
  roles: any = {};
  usuarioFull: DTODetalleUsuario;
  logged: boolean;
  cookie: string;

  constructor( private http: HttpClient ) {
    console.log('Usuarios listo');
    this.getRoles().then((res) => {
      this.roles = res;
      console.table(this.roles);
    })
  }

  //Chequea si hay un usuario logueado
  //**********************************
  checkAuth() {
    try {
      let local = localStorage.getItem('user');
      // console.log('Local => ', local);
      
      if (local) {
        
        //Si se recupera data de localStorage, se procede con:
        this.user = JSON.parse(local);
        
        //Si hay un id en el localStorage, recupera su alias y devuelve true
        if (this.user['usuario_id']) {
          console.log(this.user.alias);
          return true;
        } else {
          return false;
        }
      } else {
        
        //Si no se recupera nada de localStorage, se procede con:
        localStorage.setItem('user',JSON.stringify({ logged:false }));
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  //Método principal para manejar los requests
  //******************************************
  private request(method: string, url: string, data?: any) {
    const result = this.http.request(method, url, {
      body: data,
      responseType: 'json',
      observe: 'body',
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    });

    return new Promise((resolve, reject) => {
      result.subscribe(resolve, reject);
    });
  }

  //Métodos de Autenticación
  //************************
  async passportLogin(user: any) {
    console.log(user);

    await this.request(
      'POST',
      `${environment.serverUrl}/usuarios/passportLogin`,
      user
    )
      .then((res: any) => {
        console.log(' Respuesta ');
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

  async passportLogout() {
    await this.request(
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
    await this.request('GET', `${environment.serverUrl}/usuarios`)
      .then((res: any[]) => {
        lista = res.map((u) => u);
      })
      .catch((err: any) => {
        console.log(err);
      });

    console.log('Lista usuarios:', lista);
    return lista;
  }

  async detalleUsuario(id) {
    let usuario: any;
    await this.request(
      'GET',
      `${environment.serverUrl}/usuarios/detalle/${id}`
    ).then((res: any) => {
      console.log(res);
      usuario = res;
    });    
    return usuario[0];
  }

  async getRoles() {
    let lista: any[] = [];
    await this.request('GET', `${environment.serverUrl}/usuarios/roles`)
      .then((res: any[]) => {
        lista = res.map((rol) => rol);
      })
      .catch((err: any) => {
        console.log(err);
      });

    console.log('Lista roles:', lista);
    return lista;
  }
}
