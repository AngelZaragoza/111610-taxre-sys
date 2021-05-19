import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  user = {};

  constructor(private http: HttpClient) {
    console.log('Usuarios listo');
  }

  //Método principal para manejar los requests
  private request(method: string, url: string, data?: any) {
    // const token = await this.oktaAuth.getAccessToken();

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

  async passportLogin(user: any) {
    console.log(user);

    await this.request(
      'POST',
      `${environment.serverUrl}/usuarios/passportLogin`,
      user
    ).then((res: any) => {      
      console.log(' Respuesta ');      
      console.log( res );
    });
  }
}
