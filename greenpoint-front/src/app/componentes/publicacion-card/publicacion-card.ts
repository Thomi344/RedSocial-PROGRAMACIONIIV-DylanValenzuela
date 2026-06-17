import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../servicios/auth';
import { Publicaciones } from '../../servicios/publicaciones';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-publicacion-card',
  imports: [CommonModule],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css',
})
export class PublicacionCard implements OnInit {
  @Input() publicacion: any;

  private authService = inject(Auth);
  private publicacionesService = inject(Publicaciones);

  // --- Estado para manejar el "Me gusta" ---
  usuarioActual = this.authService.usuarioActual; // Es una Signal
  dioLike = signal<boolean>(false);
  cantidadLikes = signal<number>(0);
  estaCargandoLike = signal<boolean>(false);
  
  // --- Estado del Modal ---
  mostrarModalEliminar = signal<boolean>(false);
  estaEliminando = signal<boolean>(false);
  mostrarModalError = signal<boolean>(false);
  mensajeError = signal<string>('');

  ngOnInit() {
    this.cantidadLikes.set(this.publicacion.likes?.length || 0);
    
    // Leemos la señal UNA sola vez y la guardamos en la variable 'user'
    const user = this.usuarioActual();
    
    // Ahora usamos 'user' normalmente sin volvernos locos con los paréntesis
    if (user && this.publicacion.likes) {
      const yaLikeo = this.publicacion.likes.includes(user.id);
      this.dioLike.set(yaLikeo);
    }
  }

  async toggleLike() {
    const user = this.usuarioActual(); // Leemos la señal
    
    if (!user || this.estaCargandoLike()) return; 

    this.estaCargandoLike.set(true);

    try {
      if (this.dioLike()) {
        const res = await firstValueFrom(this.publicacionesService.quitarMeGusta(this.publicacion._id));
        this.dioLike.set(false);
        this.cantidadLikes.set(res.totalLikes);
      } else {
        const res = await firstValueFrom(this.publicacionesService.darMeGusta(this.publicacion._id));
        this.dioLike.set(true);
        this.cantidadLikes.set(res.totalLikes);
      }
    } catch (error) {
      console.error('Error al modificar me gusta', error);
      this.mensajeError.set('No pudimos procesar tu me gusta. Intentá de nuevo.');
      this.mostrarModalError.set(true);
    } finally {
      this.estaCargandoLike.set(false);
    }
  }

  abrirModal() { this.mostrarModalEliminar.set(true); }
  
  cerrarModal() {
    if (!this.estaEliminando()) { this.mostrarModalEliminar.set(false); }
  }
  
  cerrarModalError() { this.mostrarModalError.set(false); }

  async confirmarEliminacion() {
    this.estaEliminando.set(true);
    try {
      await firstValueFrom(this.publicacionesService.eliminarPublicacion(this.publicacion._id));
      this.publicacion.activa = false; 
      this.cerrarModal();
    } catch (error) {
      console.error('Error al eliminar', error);
      this.mensajeError.set('Hubo un error al eliminar la publicación.');
      this.mostrarModalError.set(true);
    } finally {
      this.estaEliminando.set(false);
    }
  }

  puedeEliminar(): boolean {
    const user = this.usuarioActual(); // Leemos la señal
    
    if (!user) return false;
    
    return this.publicacion.usuario._id === user.id || user.perfil === 'administrador';
  }
}