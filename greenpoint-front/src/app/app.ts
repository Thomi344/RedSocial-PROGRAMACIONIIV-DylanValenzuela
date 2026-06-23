import { Component, signal,inject,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet,Router } from '@angular/router';
import {Navbar} from './componentes/navbar/navbar';
import { Auth } from './servicios/auth';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-root',
  imports: [CommonModule,RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('GreenPoint');

  private authService = inject(Auth);
  private router = inject(Router);

  // --- Estado de la aplicación ---
  cargandoInicial = signal<boolean>(true);

  async ngOnInit() {
    const token = this.authService.obtenerToken();

    // --- Si no hay token, redirigimos al login ---
    if(!token) {
      this.cargandoInicial.set(false);
      this.router.navigate(['/login']);
      return;
    }
    // --- Si hay token, validamos con el backend ---
    try {
      await firstValueFrom(this.authService.validarToken());
      // --- Si el backend responde que el token es válido, seguimos en la app ---
      this.cargandoInicial.set(false);
      this.router.navigate(['/publicaciones']);
    }catch (error) {
      console.warn('Token inválido o expirado. Redirigiendo al login...');
      this.authService.cerrarSesion(); // Borra la sesión corrupta
      this.cargandoInicial.set(false);
      this.router.navigate(['/login']);
    }
  }
}
