import { Component, OnDestroy, OnInit } from '@angular/core';
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
    this.userSub = this._usuariosService.userObs$.subscribe((userLogged) => {
      this.userLogged = userLogged;
      if (this.userLogged.logged) {
        this.saludo = `Bienvenid@ ${this.userLogged.alias}`;
      } else {
        this.saludo = 'Para comenzar debe Iniciar Sesión';
      }
    });
  }

  
  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }  
}
