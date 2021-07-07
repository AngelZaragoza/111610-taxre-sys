import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  authorized: any;

  constructor(private _usuarios: UsuariosService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    
    this.authorized = await this._usuarios.checkAuth(true);

    if (this.authorized.logged) {
      console.log('Autorizado');
      return true;
    } else {
      console.error('Bloqueado por Guard: no logueado');
      this.router.navigateByUrl('/home');
      return false;
    }    

  }
}
