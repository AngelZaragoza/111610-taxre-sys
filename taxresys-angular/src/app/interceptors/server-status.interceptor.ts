import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { AlertasService } from '../services/alertas.service';
import { PreviousRouteService } from '../services/previous-route.service';
import { UsuariosService } from '../services/usuarios.service';

@Injectable()
export class ServerStatusInterceptor implements HttpInterceptor {
  constructor(
    public router: Router,
    public usuarios: UsuariosService,
    public alertas: AlertasService,
    public previous: PreviousRouteService
  ) {}

  handleErrors(
    err: any,
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Unauthorized.
    if (
      err.status === 401 &&
      this.router.url !== '/login' &&
      this.router.url !== '/home'
    ) {      
      this.usuarios.passportLogout();
      this.alertas.problemDialog
        .fire({
          title: `(${err.status})`,
          text: 'Su Sesión expiró.',
          showCancelButton: true,
          confirmButtonText: 'Log In',
          cancelButtonText: 'Inicio',
          allowEscapeKey: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            //Si el usuario confirma, se redirige a la pantalla de LogIn
            this.router.navigate(['/login']);            
          } else {
            this.router.navigate(['/home']);            
          }
        })
        .finally(() => {
          return throwError(err);
        });
    }

    // Server not running.
    if (err.status === 0) {
      this.alertas.problemDialog.fire({
        title: `Algo falló (${err.status})`,
        text: 'El servidor no responde. Intente recargar el sitio.',
      });
      // this.router.navigate([this.previous.getPreviousUrl()]);
      return throwError(err);
    }
    // this.authService.logOut();
    return throwError(err);
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next
      .handle(request)
      .pipe(catchError((err: any) => this.handleErrors(err, request, next)));
  }
}
