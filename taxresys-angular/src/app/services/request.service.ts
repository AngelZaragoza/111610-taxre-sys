import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor( private http: HttpClient ) { 
    console.log('Conexion Listo');
    
  }

  //Método principal para manejar los requests
  //******************************************
  request(method: string, url: string, data?: any) {
    const result = this.http.request(method, url, {
      body: data,
      responseType: 'json',
      observe: 'body',
      withCredentials: true,
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    });

    return new Promise((resolve, reject) => {
      result.subscribe(resolve, reject);
    });
  }
}
