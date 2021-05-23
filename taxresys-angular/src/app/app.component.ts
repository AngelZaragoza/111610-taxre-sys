import { Component, OnInit } from '@angular/core';
import { UsuariosService } from './services/usuarios.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'taxresys-angular';

  constructor ( public _usuariosService:UsuariosService ) { }  

  ngOnInit(): void { }  

}
