//Módulos
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
  OWL_DATE_TIME_LOCALE,
  OwlDateTimeIntl
} from 'ng-pick-datetime';
import { DefaultIntl } from './classes/default-intl';
import { NgxSpinnerModule } from 'ngx-spinner';

//Servicios
import { UsuariosService } from './services/usuarios.service';
import { AdherentesService } from './services/adherentes.service';
import { ChoferesService } from './services/choferes.service';
import { MovilesService } from './services/moviles.service';
import { TurnosService } from './services/turnos.service';
import { RequestService } from './services/request.service';

//Rutas
import { AppRoutingModule } from './app.routes';

//Componentes
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/usuarios/login/login.component';
import { UsuarioNuevoComponent } from './components/usuarios/usuario-nuevo.component';
import { UsuarioEditarComponent } from './components/usuarios/usuario-editar.component';
import { UsuarioListaComponent } from './components/usuarios/usuario-lista.component';
import { FormPersonaComponent } from './components/shared/form-persona/form-persona.component';
import { AdherenteListaComponent } from './components/adherentes/adherente-lista.component';
import { AdherenteNuevoComponent } from './components/adherentes/adherente-nuevo.component';
import { AdherenteEditarComponent } from './components/adherentes/adherente-editar.component';
import { ChoferListaComponent } from './components/choferes/chofer-lista.component';
import { ChoferEditarComponent } from './components/choferes/chofer-editar.component';
import { ChoferNuevoComponent } from './components/choferes/chofer-nuevo.component';
import { FormMovilComponent } from './components/shared/form-movil/form-movil.component';
import { MovilListaComponent } from './components/moviles/movil-lista.component';
import { MovilNuevoComponent } from './components/moviles/movil-nuevo.component';
import { MovilEditarComponent } from './components/moviles/movil-editar.component';
import { FormTurnoComponent } from './components/shared/form-turno/form-turno.component';
import { JornadaPlanillaComponent } from './components/jornadas/jornada-planilla.component';
import { FormJornadaComponent } from './components/shared/form-jornada/form-jornada.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    LoginComponent,
    UsuarioNuevoComponent,
    UsuarioEditarComponent,
    UsuarioListaComponent,
    FormPersonaComponent,
    AdherenteListaComponent,
    AdherenteNuevoComponent,
    AdherenteEditarComponent,
    ChoferListaComponent,
    ChoferEditarComponent,
    ChoferNuevoComponent,
    FormMovilComponent,
    MovilListaComponent,
    MovilNuevoComponent,
    MovilEditarComponent,
    FormTurnoComponent,
    JornadaPlanillaComponent,
    FormJornadaComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgxSpinnerModule
    // HttpClientXsrfModule.withOptions({
    //   cookieName: 'connect.sid',
    // }),
  ],
  providers: [
    UsuariosService,
    AdherentesService,
    ChoferesService,
    MovilesService,
    TurnosService,
    RequestService,
    { provide: OWL_DATE_TIME_LOCALE, useValue: 'es-ar' },
    { provide: OwlDateTimeIntl, useClass: DefaultIntl }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
