import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';

import { LoginComponent } from './components/usuarios/login/login.component';
import { UsuarioListaComponent } from './components/usuarios/usuario-lista.component';
import { UsuarioEditarComponent } from './components/usuarios/usuario-editar.component';
import { UsuarioNuevoComponent } from './components/usuarios/usuario-nuevo.component';

import { AdherenteListaComponent } from './components/adherentes/adherente-lista.component';
import { AdherenteNuevoComponent } from './components/adherentes/adherente-nuevo.component';
import { AdherenteEditarComponent } from './components/adherentes/adherente-editar.component';

import { ChoferListaComponent } from './components/choferes/chofer-lista.component';
import { ChoferNuevoComponent } from './components/choferes/chofer-nuevo.component';
import { ChoferEditarComponent } from './components/choferes/chofer-editar.component';

import { MovilListaComponent } from './components/moviles/movil-lista.component';
import { MovilNuevoComponent } from './components/moviles/movil-nuevo.component';
import { MovilEditarComponent } from './components/moviles/movil-editar.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'usuarios/login', component: LoginComponent },
  { path: 'usuarios/nuevo', component: UsuarioNuevoComponent },
  {
    path: 'usuarios',
    component: UsuarioListaComponent,
    children: [
      { path: 'detalle/:usuario_id', component: UsuarioEditarComponent },
    ],
  },
  { path: 'adherentes/nuevo', component: AdherenteNuevoComponent },
  {
    path: 'adherentes',
    component: AdherenteListaComponent,
    children: [
      { path: 'detalle/:adherente_id', component: AdherenteEditarComponent },
    ],
  },
  {
    path: 'choferes',
    component: ChoferListaComponent,
    children: [
      { path: 'detalle/:chofer_id', component: ChoferEditarComponent },
    ],
  },
  { path: 'choferes/nuevo', component: ChoferNuevoComponent },
  {
    path: 'moviles',
    component: MovilListaComponent,
    children: [
      { path: 'detalle/:movil_id', component: MovilEditarComponent },
    ],
  },
  { path: 'moviles/nuevo', component: MovilNuevoComponent },

  { path: '**', pathMatch: 'full', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
