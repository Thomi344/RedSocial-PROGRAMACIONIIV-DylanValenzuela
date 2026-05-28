import { ValidatorFn, ValidationErrors, AbstractControl } from "@angular/forms";

export function confirmarClaveValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
    const clave = control.get('clave')?.value;
    const repiteClave = control.get('repiteClave')?.value;

    // Si ambos tienen valor y son distintos, devolvemos el error
    if (clave && repiteClave && clave !== repiteClave) {
    return { 'clavesNoIguales': true }; 
    }
    return null;
  };
}