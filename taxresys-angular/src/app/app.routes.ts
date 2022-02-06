import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// TODO: Separar en diferentes módulos para implementar lazy loading

// Componentes libres
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/usuarios/login/login.component';

// Componentes "Usuarios"
import { UsuarioListaComponent } from './components/usuarios/usuario-lista.component';
import { UsuarioEditarComponent } from './components/usuarios/usuario-editar.component';
import { UsuarioNuevoComponent } from './components/usuarios/usuario-nuevo.component';

// Componentes "Adherentes"
import { AdherenteListaComponent } from './components/adherentes/adherente-lista.component';
import { AdherenteNuevoComponent } from './components/adherentes/adherente-nuevo.component';
import { AdherenteEditarComponent } from './components/adherentes/adherente-editar.component';

// Componentes "Choferes"
import { ChoferListaComponent } from './components/choferes/chofer-lista.component';
import { ChoferNuevoComponent } from './components/choferes/chofer-nuevo.component';
import { ChoferEditarComponent } from './components/choferes/chofer-editar.component';

// Componentes "Móviles"
import { MovilListaComponent } from './components/moviles/movil-lista.component';
import { MovilNuevoComponent } from './components/moviles/movil-nuevo.component';
import { MovilEditarComponent } from './components/moviles/movil-editar.component';

// Componentes "Turnos"
import { FormTurnoComponent } from './components/shared/form-turno/form-turno.component';

// Componentes "Jornadas"
import { JornadaPlanillaComponent } from './components/jornadas/jornada-planilla.component';
import { FormJornadaComponent } from './components/shared/form-jornada/form-jornada.component';

// Componentes "Viajes"
import { ViajePlanillaComponent } from './components/viajes/viaje-planilla.component';
import { PendienteListaComponent } from './components/viajes/pendiente-lista.component';
import { ViajeHistoricoComponent } from './components/viajes/viaje-historico.component';

// Guardianes de rutas y componente de Error
import { AuthGuard } from './auth/auth.guard';
import { OwnerGuard } from './auth/owner.guard';
import { TurnoGuard } from './guards/turno.guard';
import { JornadaGuard } from './guards/jornada.guard';
import { AdminGuard } from './auth/admin.guard';
import { ErrorComponent } from './components/shared/error/error.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'usuarios',
    component: UsuarioListaComponent,
    children: [
      { path: 'detalle/:usuario_id', component: UsuarioEditarComponent },
      {
        path: 'nuevo',
        component: UsuarioNuevoComponent,
        canActivate: [AdminGuard],
      },
    ],
    canActivate: [AuthGuard],
  },

  {
    path: 'adherentes',
    component: AdherenteListaComponent,
    children: [
      { path: 'detalle/:adherente_id', component: AdherenteEditarComponent },
      {
        path: 'nuevo',
        component: AdherenteNuevoComponent,
        canActivate: [AdminGuard],
      },
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
    canActivate: [AuthGuard],
  },

  {
    path: 'turnos/:operacion',
    component: FormTurnoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'jornadas',
    component: JornadaPlanillaComponent,
    canActivate: [AuthGuard],
    canActivateChild: [JornadaGuard],
    children: [
      { path: 'cierre', component: FormJornadaComponent },
      { path: 'inicio', component: FormJornadaComponent },
      { path: 'error', component: ErrorComponent },
    ],
  },
  {
    path: 'viajes',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'turno',
        component: ViajePlanillaComponent,
        canActivate: [TurnoGuard, OwnerGuard],
      },
      {
        path: 'hist-viajes',
        component: ViajeHistoricoComponent,
      },
      {
        path: 'pendientes',
        component: PendienteListaComponent,
      },
    ],
  },

  { path: 'error', component: ErrorComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'error' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [AuthGuard, OwnerGuard, TurnoGuard, JornadaGuard, AdminGuard],
})
export class AppRoutingModule {}
