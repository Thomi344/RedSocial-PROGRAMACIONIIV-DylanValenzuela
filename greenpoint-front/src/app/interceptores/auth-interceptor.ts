import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../servicios/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const token = authService.obtenerToken();

  // --- 1. Clonamos la petición y le agregamos el token si existe ---
  // --- Si no hay token, pasamos la petición original sin modificar ---
  let peticionClonada = req;
  if (token) {
    peticionClonada = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // --- 2. Pasamos la petición clonada al siguiente interceptor o al backend ---
  return next(peticionClonada).pipe(
    catchError((error: HttpErrorResponse) => {
      // ---  Si el error es 401 (Unauthorized), cerramos la sesión y redirigimos al login ---
      if (error.status === 401) {
        console.warn('El token expiró. Cerrando sesión por seguridad...');
        authService.cerrarSesion(); // Borra la sesión corrupta
        router.navigate(['/login']); 
      }
      return throwError(() => error);
    })
  );
};