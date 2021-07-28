import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [],
})
export class HomeComponent implements OnInit, OnDestroy {
  saludo: string;
  userLogged: any;
  userSub: Subscription;

  constructor(private _usuariosService: UsuariosService) { }

  ngOnInit(): void {
    this._usuariosService.userObs$.asObservable().subscribe()
    this.userSub = this._usuariosService.userObs$.subscribe((userLogged) => {
      console.log('|| Desde Suscripcion ||', userLogged);
      this.userLogged = userLogged;
      if (this.userLogged.logged) {
        this.saludo = `Bienvenid@ ${this.userLogged.alias}`;
      } else {
        this.saludo = 'Para comenzar debe Iniciar Sesión';
      }
    });
    this._usuariosService.checkAuth(false);
    
  }

  
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    this.userSub.unsubscribe();
  }  
}
