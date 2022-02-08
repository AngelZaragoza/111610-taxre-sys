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
  userLogged: any;

  constructor(private _usuarios: UsuariosService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    
    // this.userLogged = this._usuarios.user ? this._usuarios.user.logged : false
    this.userLogged = this._usuarios.readUser();
    if (this.userLogged.logged) {
      return true;
    }
    console.error('Bloqueado por Guard: no logueado');
    this.router.navigateByUrl('/home');
    return false;
    
  }
}
