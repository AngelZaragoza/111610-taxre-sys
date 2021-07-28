import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UsuariosService } from '../services/usuarios.service';

@Injectable({
  providedIn: 'root',
})
export class OwnerGuard implements CanActivate {
  constructor(private _usuarios: UsuariosService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> | boolean | UrlTree {
    //Compara el id del usuario logueado con el usuario con el último turno abierto
    const isOwner =
      this._usuarios.user.logged &&
      this._usuarios.user.usuario_id === this._usuarios.user.owner;
    console.log('|| Llegó al OwnerGuard ||', isOwner);

    if (isOwner) {
      console.log('Route', route, 'State', state);
      return true;
    } else {
      console.log('Route', route, 'State', state);
      this.router.navigateByUrl('/error');
      return false;
    }
  }
}
