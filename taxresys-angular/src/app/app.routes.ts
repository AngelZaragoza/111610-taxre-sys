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

//Temporal, hasta que implemente el modal
import { FormTurnoComponent } from './components/shared/form-turno/form-turno.component';

import { JornadaPlanillaComponent } from './components/jornadas/jornada-planilla.component';
import { FormJornadaComponent } from './components/shared/form-jornada/form-jornada.component';

import { ViajePlanillaComponent } from './components/viajes/viaje-planilla.component';
import { PendienteListaComponent } from './components/viajes/pendiente-lista.component';

//Guardianes de rutas
import { AuthGuard } from './auth/auth.guard';
import { OwnerGuard } from './auth/owner.guard';
import { ErrorComponent } from './components/shared/error/error.component';
import { ViajeHistoricoComponent } from './components/viajes/viaje-historico.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'usuarios/login', component: LoginComponent },
  // { path: 'usuarios/nuevo', component: UsuarioNuevoComponent },
  {
    path: 'usuarios',
    component: UsuarioListaComponent,
    children: [
      { path: 'detalle/:usuario_id', component: UsuarioEditarComponent },
      { path: 'nuevo', component: UsuarioNuevoComponent },
    ],
  },

  {
    path: 'adherentes',
    component: AdherenteListaComponent,
    children: [
      { path: 'detalle/:adherente_id', component: AdherenteEditarComponent },
      { path: 'nuevo', component: AdherenteNuevoComponent },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'choferes',
    component: ChoferListaComponent,
    children: [
      { path: 'detalle/:chofer_id', component: ChoferEditarComponent },
      { path: 'nuevo', component: ChoferNuevoComponent },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'moviles',
    component: MovilListaComponent,
    children: [
      { path: 'detalle/:movil_id', component: MovilEditarComponent },
      { path: 'nuevo', component: MovilNuevoComponent },
    ],
  },

  {
    path: 'turnos/:operacion',
    component: FormTurnoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'jornadas',
    component: JornadaPlanillaComponent,
    children: [
      { path: 'cierre', component: FormJornadaComponent },
      { path: 'inicio', component: FormJornadaComponent },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'viajes',
    children: [
      {
        path: 'turno',
        component: ViajePlanillaComponent,
        canActivate: [AuthGuard, OwnerGuard],
      },
      {
        path: 'hist-viajes',
        component: ViajeHistoricoComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'pendientes',
        component: PendienteListaComponent,
        canActivate: [AuthGuard],
      },
    ],
  },

  { path: 'error', component: ErrorComponent },
  { path: '**', pathMatch: 'full', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, OwnerGuard],
})
export class AppRoutingModule {}
