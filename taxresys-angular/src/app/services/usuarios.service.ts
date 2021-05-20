import { Injectable } from '@angular/core';
import { HttpClient, HttpXsrfTokenExtractor } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  user: any = {};
  cookie: string;

  constructor(private http: HttpClient, private token: HttpXsrfTokenExtractor) {
    console.log('Usuarios listo');
    // this.cookie = await this.token.getToken();    
  }

  checkAuth() {
    try {
      let local = localStorage.getItem('user');
      console.log('Local => ', local);
      this.user = JSON.parse(local);

      if (this.user['usuario_id']) {
        console.log(this.user.alias);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  //Método principal para manejar los requests
  private request(method: string, url: string, data?: any) {

    const result = this.http.request(method, url, {
      body: data,
      responseType: 'json',
      observe: 'body',
      //withCredentials: true //probar para recibir cookies
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    });

    return new Promise((resolve, reject) => {
      result.subscribe(resolve, reject);
    });
  }

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
        console.log(err.status);        
        // this.user = {};
        // console.log(this.user);
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
      });
  }
}
