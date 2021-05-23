import { Routes } from '@angular/router';

import { UsuarioNuevoComponent } from './usuario-nuevo.component';
import { UsuarioEditarComponent } from './usuario-editar.component';


export const USUARIO_ROUTES: Routes = [
  { path: 'nuevo', component: UsuarioNuevoComponent },
  { path: 'detalle/:usuario_id', component: UsuarioEditarComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'lista' },
];
