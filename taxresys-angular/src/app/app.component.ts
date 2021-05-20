import { Component, OnInit } from '@angular/core';
import { UsuariosService } from './services/usuarios.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'taxresys-angular';
  logged = false;
  user = {};

  constructor ( public _usuariosService:UsuariosService ) { }  

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.logged = this._usuariosService.checkAuth();
    if(this.logged) {
      this.user = this._usuariosService.user;
      console.log('Logueado: ', this.logged);
    }
  }  

}
