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
export class OwnerGuard implements CanActivate {
  constructor(private _usuarios: UsuariosService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> | boolean | UrlTree {    
    // Si el Usuario logueado no es el igual al Usuario que abrió el Turno,
    // impide la navegación y redirige a la página de error correspondiente.
    const isOwner = this._usuarios.user.usuario_id === this._usuarios.user.owner;
    if (!isOwner) {      
      this.router.navigate(['/error'], {queryParams: {origin: 'turno-dif-usuario' }})
      return false;
    }
    
    return true;
  }
}
