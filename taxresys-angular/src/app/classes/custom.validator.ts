import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  // Expresiones regulares
  // **********************
  static get ALFANUM_NO_SIMBOLOS(): RegExp {
    return /^[^!@"#·$~=*]*[\w-+. /áéíóú]+$/;
  }

  static get ALFANUM_NO_ESPACIOS(): RegExp {
    return /^[\w]+$/;
  }

  static get NUMERICO(): RegExp {
    return /^[\d]+$/;
  }

  static get TELEFONO(): RegExp {
    return /^[+0-9-]+$/;
  }

  // Validator Functions
  // **********************
  /** Valida que los passwords introducidos sean iguales */
  static confirmaPassword: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    let pass1 = control.get('password');
    let pass2 = control.get('passwordConfirm');

    return pass1.value !== pass2.value ? { nocoincide: true } : null;
  };

  /** Valida que el dominio (chapa patente) introducido por usuario
   * respete el formato Mercosur (AA-999-BB) o Argentina pre-2016 (AAA-999)
   */
  static validaPatente: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    if (control.pristine) {
      return null;
    }
    // Regexp para validar chapas patente (Mercosur y Argentina anterior)
    const PATENTE_MERCOSUR = /^[a-zA-Z]{2}-[0-9]{3}-[a-zA-Z]{2}$/;
    const PATENTE_ARG = /^[a-zA-Z]{3}-[0-9]{3}$/;

    // Si el test con las regexp pasa, se retorna null
    if (
      PATENTE_MERCOSUR.test(control.value) ||
      PATENTE_ARG.test(control.value)
    ) {
      return null;
    }

    // Si el test no pasa, se retorna el objeto de error
    return { patenteinvalida: true };
  };
}

//Para validar que los passwords introducidos sean iguales
export const confirmaPassword: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  let pass1 = control.get('password');
  let pass2 = control.get('passwordConfirm');

  return pass1.value !== pass2.value ? { nocoincide: true } : null;
};
