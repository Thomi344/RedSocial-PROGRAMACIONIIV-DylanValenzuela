import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Publicaciones } from '../../servicios/publicaciones';
import { PublicacionCard } from '../publicacion-card/publicacion-card';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-publicacion-detalle',
  imports: [CommonModule, PublicacionCard],
  templateUrl: './publicacion-detalle.html'
})
export class PublicacionDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private publicacionesService = inject(Publicaciones);

  publicacion = signal<any>(null);
  cargando = signal<boolean>(true);
  error = signal<boolean>(false);

  async ngOnInit() {
    // --- Obtenemos el ID de la publicación desde la URL ---
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        const data = await firstValueFrom(this.publicacionesService.obtenerPublicacionPorId(id));
        this.publicacion.set(data);
      } catch (err) {
        console.error('Error al cargar la publicación', err);
        this.error.set(true);
      } finally {
        this.cargando.set(false);
      }
    }
  }
}