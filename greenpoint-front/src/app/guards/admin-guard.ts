import { CanActivateFn,Router } from '@angular/router';
import { Auth } from '../servicios/auth';
import { inject } from '@angular/core';
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // --- Lee el usuario actual desde el servicio Auth ---
  const usuarioActual = authService.usuarioActual();

  if(usuarioActual && usuarioActual.perfil === 'admin') {
    return true; // Permite el acceso si el usuario es admin
  }
  router.navigate(['/login']); // Redirige al login si no es admin
  return false; // Bloquea el acceso
};
