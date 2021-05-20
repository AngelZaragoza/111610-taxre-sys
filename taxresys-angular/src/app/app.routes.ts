import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/usuarios/login/login.component';
import { USUARIO_ROUTES } from './components/usuarios/usuario.routes';

import { UsuarioListaComponent } from './components/usuarios/usuario-lista.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'usuarios/login', component: LoginComponent },
  {
    path: 'usuarios/lista',
    component: UsuarioListaComponent,
    children: USUARIO_ROUTES,
  },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
