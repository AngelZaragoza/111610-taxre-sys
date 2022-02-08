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
  { path: 'home', component: HomeComponent, data: { title: 'Home' } },
  { path: 'login', component: LoginComponent, data: { title: 'Log In' } },
  {
    path: 'usuarios',
    component: UsuarioListaComponent,
    data: { title: 'Usuarios' },
    children: [
      {
        path: 'detalle/:usuario_id',
        component: UsuarioEditarComponent,
        data: { title: 'Detalle' },
      },
      {
        path: 'nuevo',
        component: UsuarioNuevoComponent,
        canActivate: [AdminGuard],
        data: { title: 'Nuevo Usuario' },
      },
    ],
    canActivate: [AuthGuard],
  },

  {
    path: 'adherentes',
    component: AdherenteListaComponent,
    data: { title: 'Adherentes' },
    children: [
      {
        path: 'detalle/:adherente_id',
        component: AdherenteEditarComponent,
        data: { title: 'Detalle' },
      },
      {
        path: 'nuevo',
        component: AdherenteNuevoComponent,
        canActivate: [AdminGuard],
        data: { title: 'Nuevo Adherente' },
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'choferes',
    component: ChoferListaComponent,
    data: { title: 'Choferes' },
    children: [
      {
        path: 'detalle/:chofer_id',
        component: ChoferEditarComponent,
        data: { title: 'Detalle' },
      },
      {
        path: 'nuevo',
        component: ChoferNuevoComponent,
        data: { title: 'Nuevo Chofer' },
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'moviles',
    component: MovilListaComponent,
    data: { title: 'Móviles' },
    children: [
      {
        path: 'detalle/:movil_id',
        component: MovilEditarComponent,
        data: { title: 'Detalle' },
      },
      {
        path: 'nuevo',
        component: MovilNuevoComponent,
        data: { title: 'Nuevo Móvil' },
      },
    ],
    canActivate: [AuthGuard],
  },

  {
    path: 'turnos/:operacion',
    component: FormTurnoComponent,
    canActivate: [AuthGuard],
    data: { title: 'Turnos' },
  },
  {
    path: 'jornadas',
    component: JornadaPlanillaComponent,
    canActivate: [AuthGuard],
    canActivateChild: [JornadaGuard],
    data: { title: 'Jornadas' },
    children: [
      {
        path: 'cierre',
        component: FormJornadaComponent,
        data: { title: 'Cierre' },
      },
      {
        path: 'inicio',
        component: FormJornadaComponent,
        data: { title: 'Inicio' },
      },
      { path: 'error', component: ErrorComponent, data: { title: 'Error' } },
    ],
  },
  {
    path: 'viajes',
    canActivate: [AuthGuard],
    data: { title: 'Viajes' },
    children: [
      {
        path: 'turno',
        component: ViajePlanillaComponent,
        canActivate: [TurnoGuard, OwnerGuard],
        data: { title: 'Planilla del Turno' },
      },
      {
        path: 'hist-viajes',
        component: ViajeHistoricoComponent,
        data: { title: 'Histórico' },
      },
      {
        path: 'pendientes',
        component: PendienteListaComponent,
        data: { title: 'Pendientes' },
      },
    ],
  },

  { path: 'error', component: ErrorComponent, data: { title: 'Error' } },
  { path: '**', pathMatch: 'full', redirectTo: 'error' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [AuthGuard, OwnerGuard, TurnoGuard, JornadaGuard, AdminGuard],
})
export class AppRoutingModule {}
