import { ValidatorFn, ValidationErrors, AbstractControl } from "@angular/forms";

// --- Validador personalizado: Verifica que la fecha no sea en el futuro ---
export function fechaPasadaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;
            const fechaIngresada = new Date(control.value);
            const hoy = new Date();
            // Ajusta las horas a cero para comparar solo la fecha
            hoy.setHours(0, 0, 0, 0); 
            
            if (fechaIngresada >= hoy) {
                return { fechaFutura: true };
            }
            const fechaMinima = new Date('1930-01-01');
            if (fechaIngresada < fechaMinima) {
                return { fechaMuyAntigua: true }; // Dispara el nuevo error
            }
            return null;
    };
}