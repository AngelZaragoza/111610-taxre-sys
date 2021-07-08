import { Component, DoCheck, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdherentesService } from '../../services/adherentes.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Persona } from '../../classes/persona';
import { Adherente } from '../../classes/adherente';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-adherente-editar',
  templateUrl: './adherente-editar.component.html',
  styles: [],
})
export class AdherenteEditarComponent {
  @ViewChild('editExtra', { read: ElementRef }) llamaModal: ElementRef;

  idParam: any;
  editar: boolean;
  loading: boolean = true;

  //Clases modelo para los objetos
  detalle: any = {};
  persona: Persona = new Persona();
  adherente: Adherente = new Adherente();

  //Formulario de edición
  editAdherente: FormGroup;

  constructor(
    public _adherentesService: AdherentesService,
    private activatedRoute: ActivatedRoute,
    private _usuariosService: UsuariosService
  ) {
    this.editAdherente = new FormGroup({
      persona_id: new FormControl(0),
      adherente_id: new FormControl(0),
      moviles_activos: new FormControl(0),
      observaciones: new FormControl('', Validators.maxLength(300)),
    });

    //Se ejecuta con cada llamada a la ruta que renderiza este componente
    //excepto cuando el parámetro que viene con la ruta no cambia.
    //Setea "editar" en falso para evitar ediciones accidentales.
    this.activatedRoute.params.subscribe((params) => {
      this.idParam = params['adherente_id'];
      this.editar = false;

      this.detalleAdherente(this.idParam).finally(() => {
        console.table(this.adherente);
        console.table(this.persona);
        this.editAdherente.setValue(this.adherente);
      });
    });
  }

  ngOnInit(): void {}

  async detalleAdherente(id) {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'adh_detalle');
    this.detalle = await this._adherentesService.detalleAdherente(id);

    for (let field in this.detalle) {
      //Toma los campos del detalle y los divide en sus respectivos objetos
      if (this.adherente[field] !== undefined)
        this.adherente[field] = this.detalle[field];
      if (this.persona[field] !== undefined)
        this.persona[field] = this.detalle[field];
    }

    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'adh_detalle');
  }

  activarEdicion() {
    this.editar = !this.editar;
  }

  listenPersona(persona) {
    //Recibe el objeto "persona" desde el evento del componente hijo
    this.persona = persona;
    this.activarEdicion();
    console.table(this.persona);
    this.updatePersona();
  }

  async updatePersona() {
    let result = await this._adherentesService.updatePersona(
      this.persona,
      this.persona.persona_id
    );
    if (result['success']) {
      alert(`Datos Actualizados!: ${result['resp']['info']}`);
      // this.route.navigateByUrl('/home');
    } else {
      alert(`Algo falló`);
    }
  }

  async updateAdherente() {
    this.loading = true;

    this.adherente = this.editAdherente.value;
    let cierraModal = document.querySelector('#toggleModal');
    console.log(cierraModal);
    console.log(this.llamaModal);

    //Pide confirmación para el guardado (a mejorar aspecto...)
    if (confirm(`¿Guardar cambios?`)) {
      let result = await this._adherentesService.updateAdherente(
        this.adherente,
        this.adherente.adherente_id
      );

      if (result['success']) {
        //Envía un evento 'click' al botón que abre y cierra el modal
        cierraModal.dispatchEvent(new Event('click', { bubbles: true }));
        // this.llamaModal.nativeElement['modal']('toggle');
        alert(`Datos Actualizados!: ${result['resp']['info']}`);
      } else {
        alert(`Algo falló`);
      }
    }

    this.loading = false;
  }
}
