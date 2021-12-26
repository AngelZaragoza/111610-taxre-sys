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
export class TurnoGuard implements CanActivate {
  constructor(private _usuarios: UsuariosService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> | boolean | UrlTree {
    // Si no hay un Turno abierto, impide la navegación
    // y redirige a la página de error correspondiente.    
    if (!this._usuarios.user.open) {
      if (state.url === '/viajes/turno') {
        this.router.navigate(['/error'], {
          queryParams: { origin: 'turno-viajes-pln' },
        });
      }
      return false;
    }
    
    return true;
  }
}
