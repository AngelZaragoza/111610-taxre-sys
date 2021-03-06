import { Injectable } from '@angular/core';
import Swal from 'sweetalert2/dist/sweetalert2.all.js';

@Injectable({
  providedIn: 'root',
})
export class AlertasService {
  //Objetos para Alertas y Toasts
  confirmDialog: any;
  successDialog: any;
  problemDialog: any;
  infoDialog: any;

  constructor() {
    this.confirmDialog = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary',
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: true,
    });

    this.successDialog = Swal.mixin({
      icon: 'success',
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    this.problemDialog = Swal.mixin({
      icon: 'error',
      position: 'center',
      allowOutsideClick: false,
    });

    this.infoDialog = Swal.mixin({
      icon: 'info',
      position: 'center',
    });
  }
}
