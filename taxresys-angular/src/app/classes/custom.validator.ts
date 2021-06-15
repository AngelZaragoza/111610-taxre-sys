import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export class CustomValidators {}

//Para validar que los passwords introducidos sean iguales
export const confirmaPassword: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  let pass1 = control.get('password');
  let pass2 = control.get('passwordConfirm');

  return pass1.value !== pass2.value ? { nocoincide: true } : null;
};
