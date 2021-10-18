//Módulos
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
  OWL_DATE_TIME_LOCALE,
  OwlDateTimeIntl,
} from 'ng-pick-datetime';
import { DefaultIntl } from './classes/default-intl';
import { NgxSpinnerModule } from 'ngx-spinner';

//Rutas
import { AppRoutingModule } from './app.routes';

//Componentes
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { ErrorComponent } from './components/shared/error/error.component';
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

import { FormViajeComponent } from './components/shared/form-viaje/form-viaje.component';
import { ViajePlanillaComponent } from './components/viajes/viaje-planilla.component';
import { PendienteListaComponent } from './components/viajes/pendiente-lista.component';
import { ViajeHistoricoComponent } from './components/viajes/viaje-historico.component';

//Pipes personalizados
import { NombreCompletoPipe } from './pipes/nombre-completo.pipe';
import { NomElemPipe } from './pipes/nom-elem.pipe';
import { NroMovilPipe } from './pipes/nro-movil.pipe';
import { FiltroChoferEstadoPipe } from './pipes/filtro-chofer-estado.pipe';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ErrorComponent,
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
    FormViajeComponent,
    ViajePlanillaComponent,
    PendienteListaComponent,
    ViajeHistoricoComponent,
    NombreCompletoPipe,
    NomElemPipe,
    NroMovilPipe,
    FiltroChoferEstadoPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModalModule,
    NgbTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgxSpinnerModule,
  ],
  providers: [    
    // Configuración para el componente DateTimePicker
    { provide: OWL_DATE_TIME_LOCALE, useValue: 'es-ar' },
    { provide: OwlDateTimeIntl, useClass: DefaultIntl },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
