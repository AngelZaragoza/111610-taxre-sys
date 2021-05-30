import { Routes } from '@angular/router';

import { UsuarioEditarComponent } from './usuario-editar.component';


export const USUARIO_ROUTES: Routes = [
  { path: 'detalle/:usuario_id', component: UsuarioEditarComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'lista' },
];
