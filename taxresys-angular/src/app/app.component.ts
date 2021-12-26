import { Component, OnInit } from '@angular/core';
import { UsuariosService } from './services/usuarios.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'taxresys-angular';
  loading: boolean;
  userLogged: any;

  constructor ( public _usuariosService:UsuariosService ) {}  
  
  ngOnInit(): void { 
    this.loading = true;
    this.primeraCarga();
  }  

  private async primeraCarga() {    
    this._usuariosService.mostrarSpinner(this.loading, 'inicio');
    await this._usuariosService.checkAuth();
    this.userLogged = this._usuariosService.user;
    setTimeout(() => {
      this.loading = false;
      this._usuariosService.mostrarSpinner(this.loading, 'inicio');
    }, 200);
  }
}
