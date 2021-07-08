import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Chofer } from 'src/app/classes/chofer';
import { Persona } from 'src/app/classes/persona';
import { ChoferesService } from 'src/app/services/choferes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-chofer-editar',
  templateUrl: './chofer-editar.component.html',
  styles: [],
})
export class ChoferEditarComponent implements OnInit {
  //Crea una referencia a un elemento del DOM  
  @ViewChild('editCarnet', { read: ElementRef }) modalCarnet: ElementRef;
  
  idParam: any;
  editar: boolean;
  loading: boolean = true;

  //Clases modelo para los objetos
  detalle: any = {};
  persona: Persona = new Persona();
  chofer: Chofer = new Chofer();

  //Formulario de edición
  editChofer: FormGroup;
  
  constructor(
    private _choferesService: ChoferesService,
    private _usuariosService: UsuariosService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {
    
    this.initForm();
    //Se ejecuta con cada llamada a la ruta que renderiza este componente
    //excepto cuando el parámetro que viene con la ruta no cambia.
    //Setea "editar" en falso para evitar ediciones accidentales.
    this.activatedRoute.params.subscribe((params) => {
      this.idParam = params['chofer_id'];
      this.editar = false;

      this.detalleChofer(this.idParam).finally(() => {
        console.table(this.chofer);
        console.table(this.persona);
        this.editChofer.setValue(this.chofer);
      });
    });
  }

  ngOnInit(): void {}

  initForm() {
    this.editChofer = this.formBuilder.group({
      chofer_id: new FormControl(0),
      persona_id: new FormControl(0),
      carnet_nro: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(22),
      ]),
      carnet_vence: new FormControl('', Validators.required),
      habilitado: new FormControl(1),
    });
  }

  async detalleChofer(id) {
    this.loading = true;
    this._usuariosService.mostrarSpinner(this.loading, 'chofer_detalle');
    this.detalle = await this._choferesService.detalleChofer(id);

    for (let field in this.detalle) {
      //Toma los campos del detalle y los divide en sus respectivos objetos
      if (this.chofer[field] !== undefined)
        this.chofer[field] = this.detalle[field];
      if (this.persona[field] !== undefined)
        this.persona[field] = this.detalle[field];
    }

    this.loading = false;
    this._usuariosService.mostrarSpinner(this.loading, 'chofer_detalle');
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
    let result = await this._choferesService.updatePersona(
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

  async updateChofer() {
    this.loading = true;

    this.chofer = this.editChofer.value;
    let cierraModal = document.querySelector('#toggleModal');
    console.log(cierraModal);    

    //Pide confirmación para el guardado (a mejorar aspecto...)
    if (confirm(`¿Guardar cambios?`)) {
      let result = await this._choferesService.updateChofer(
        this.chofer,
        this.chofer.chofer_id
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
