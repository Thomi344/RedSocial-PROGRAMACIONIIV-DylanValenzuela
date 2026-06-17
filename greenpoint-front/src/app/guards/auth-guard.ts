import { CanActivateFn ,Router} from '@angular/router';
import { inject } from '@angular/core';
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // --- Verificamos si el token de autenticación existe en el localStorage ---
  const token = localStorage.getItem('token_greenpoint');

  if (token) {
    // Si hay token, lo dejamos pasar a la ruta
    return true;
  } else {
    // Si no hay token se le niega el acceso y se redirige al login
    router.navigate(['/login']);
    return false;
  }
};
