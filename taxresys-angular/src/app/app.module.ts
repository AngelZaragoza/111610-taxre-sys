import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

//Servicios
import { UsuariosService } from './services/usuarios.service';
import { AdherentesService } from './services/adherentes.service';
import { ChoferesService } from './services/choferes.service';
import { MovilesService } from './services/moviles.service';
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
import { MovilListaComponent } from './components/moviles/movil-lista.component';
import { MovilDetalleComponent } from './components/moviles/movil-detalle.component';



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
    MovilListaComponent,
    MovilDetalleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'connect.sid'
    })
  ],
  providers: [
    UsuariosService,
    AdherentesService,
    ChoferesService,
    MovilesService,
    RequestService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
