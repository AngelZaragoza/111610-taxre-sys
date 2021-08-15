import { Component, ViewChild, TemplateRef } from '@angular/core';
import { AdherentesService } from '../../services/adherentes.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Persona } from '../../classes/persona';
import { Adherente } from '../../classes/adherente';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertasService } from 'src/app/services/alertas.service';

@Component({
  selector: 'app-adherente-nuevo',
  templateUrl: './adherente-nuevo.component.html',
  styles: [],
})
export class AdherenteNuevoComponent {
  //Crea una referencia ...  
  @ViewChild('extraInfo', { read: TemplateRef }) extraModal: TemplateRef<any>;
  modalRef: NgbModalRef;

  //Clases modelo para los objetos
  detalle: any = {};
  persona: Persona = new Persona();
  adherente: Adherente = new Adherente();

  //Formulario
  newAdherente: FormGroup;  

  //Listo para guardar nuevo Adherente
  ready: boolean;
  loading: boolean;
  changes: boolean;

  constructor(
    private _adherentesService: AdherentesService,
    private modalService: NgbModal,
    private _alertas: AlertasService,
    private route: Router
  ) {
    //Controles del formulario
    this.newAdherente = new FormGroup({
      moviles_activos: new FormControl(0, Validators.required),
      observaciones: new FormControl(null),
    });

    //Listo para guardar nuevo Adherente: false
    this.ready = false;
    this.changes = false;
  }

  listenNuevo(persona: Persona) {
    //Recibe el objeto "persona" desde el evento del componente hijo
    this.persona = persona;

    //Listo para guardar nuevo adherente: true
    this.ready = true;
    // console.log('Nueva Persona =>');
    // console.table(this.persona);
    this.triggerModal(this.extraModal);
  }

  triggerModal(content: TemplateRef<any>) {
    this.modalRef = this.modalService
      .open(content, {
        ariaLabelledBy: 'staticBackdropLabel',
        backdrop: 'static',
        centered: true,
        keyboard: false,
        modalDialogClass: 'modal-dialog',
        windowClass: 'modal fade',
      });
      // .result.then(
      //   (res) => {
      //     console.log(`Cerrado: ${res}`);
      //     //Recibe el objeto con los datos de "usuario" del form
      //     console.log('Formulario =>', this.newAdherente.value);

      //     // this.adherente = { ...this.newAdherente.value };
      //     this.saveAdherente();
      //   },
      //   (rej) => {
      //     console.log(`Dismissed: ${rej}`);
      //   }
      // );
  }

  confirmaGuardado() {
    //Recibe el objeto con los datos de "usuario" del form
    this.adherente = { ...this.newAdherente.value };
    // console.table(this.adherente);

    let mensaje = `¿Guarda el Nuevo Adherente: ${this.persona.apellido}, ${this.persona.nombre}?`;
    this._alertas.confirmDialog
      .fire({
        title: 'Guardar Datos',
        text: mensaje,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      })
      .then((result) => {
        if (result.isConfirmed) {
          //Si el usuario confirma, se llama el método que guarda en la DB
          this.saveAdherente();
        }
      });
  }
  
  async saveAdherente() {    
    this.loading = true;
    let mensaje: string;
    let result: any;
    
    //Crea un objeto "detalle" uniendo "persona" y "adherente"
    this.detalle = { ...this.persona, ...this.adherente };
    console.table(this.detalle);
    
    try {
      //Envia el objeto "detalle" al servicio para guardar en la DB
      result = await this._adherentesService.nuevoAdherenteFull(this.detalle);
    } catch (error) {
      result = error;
    }

    if (result instanceof HttpErrorResponse) {
      mensaje = `${result['error']['message']} -- ${result['statusText']} -- No se guardaron datos.`;
      this._alertas.problemDialog.fire({
        title: 'Algo falló',
        text: mensaje,
      });
    } else {
      mensaje = `Nuevo Adherente Creado. Espere...`;
      this._alertas.successDialog.fire({
        position: 'center',
        title: 'Adherente Guardado!',
        text: mensaje,
        didOpen: () => {
          this.ready = true;
          this.changes = true;
          this.modalRef.close();
          this.route.navigateByUrl('/adherentes');
        },
      });
    }

    this.loading = false;
    /*
    //Pide confirmación para el guardado (a mejorar aspecto...)
    if(confirm(`Guardar nuevo Adherente?`)) {
      let result = await this._adherentesService.nuevoAdherenteFull(this.detalle);
  
      if (result instanceof HttpErrorResponse) {
        alert(
          `Algo falló:\n${result.error.err?.code} \n ${result.statusText}\nNo se guardaron datos.`
        );
      } else {
        alert(
          `Adherente guardado: ${result['adher']['apellido']} ${result['adher']['nombre']}!`
        );
        this.modalRef.close();
        this.route.navigateByUrl('/home');
      }
    }
    */
  }
}
