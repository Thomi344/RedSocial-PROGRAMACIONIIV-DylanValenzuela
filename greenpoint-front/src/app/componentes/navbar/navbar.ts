import { Component,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../servicios/auth';

@Component({
  selector: 'app-navbar',
  standalone: true, 
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  private authService = inject(Auth);
  private router = inject(Router);

  logeado = this.authService.estaLogeado;
  usuario = this.authService.usuarioActual;

  cerrarSesion() {
    this.authService.cerrarSesion(); 
    this.router.navigate(['/login']); 
  }
}