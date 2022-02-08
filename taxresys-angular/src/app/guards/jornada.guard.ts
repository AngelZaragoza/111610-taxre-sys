import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';

@Injectable({
  providedIn: 'root',
})
export class JornadaGuard implements CanActivateChild {
  constructor(private _usuarios: UsuariosService, private router: Router) {}

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> | boolean | UrlTree {    
    if (!this._usuarios.user.open) {
      if (
        state.url.includes('inicio') ||
        state.url.includes('cierre')
      ) {
        this.router.navigate(['/jornadas/error'], {
          queryParams: { origin: 'turno-jornadas-pln' },
        });
        return false;
      }
    }
    return true;
  }
}
