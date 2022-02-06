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
export class AdminGuard implements CanActivate {
  constructor(private _usuarios: UsuariosService, private _router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    if (state.url.includes('usuarios') && this._usuarios.user['rol_id'] !== 1) {
      this._router.navigate(['error'], {
        queryParams: { origin: 'not-admin' },
      });
      return false;
    }
    if (this._usuarios.user['rol_id'] > 2) {
      this._router.navigate(['error'], {
        queryParams: { origin: 'not-admin-manager' } 
      });      
      return false;
    }

    return true;
  }
}
