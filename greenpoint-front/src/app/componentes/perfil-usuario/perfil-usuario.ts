import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Usuarios } from '../../servicios/usuarios';
import { Publicaciones } from '../../servicios/publicaciones';
import { PublicacionCard } from '../publicacion-card/publicacion-card';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, PublicacionCard],
  templateUrl: './perfil-usuario.html'
})
export class PerfilUsuario implements OnInit {
  private route = inject(ActivatedRoute);
  private usuarios = inject(Usuarios);
  private publicaciones = inject(Publicaciones);

  usuario = signal<any>(null);
  susPublicaciones = signal<any[]>([]);
  cargando = signal<boolean>(true);

  ngOnInit() {
    // --- Leemos el ID del usuario desde la URL y cargamos su perfil ---
    this.route.paramMap.subscribe(params => {
      const idUsuario = params.get('id');
      if (idUsuario) {
        this.cargarPerfil(idUsuario);
      }
    });
  }

  async cargarPerfil(id: string) {
    this.cargando.set(true);
    try {
      // --- 1. Traemos los datos del usuario ---
      const resUsuario = await firstValueFrom(this.usuarios.obtenerUsuario(id));
      const datosUsuario = resUsuario.usuario || resUsuario.data || resUsuario;
      this.usuario.set(datosUsuario);

      // --- 2. Traemos las publicaciones del usuario ---
      const susPosteos = await firstValueFrom(this.publicaciones.obtenerPublicaciones('fecha', 1, 50, id));
      this.susPublicaciones.set(susPosteos.publicaciones || susPosteos.data || susPosteos);

    } catch (error) {
      console.error('Error al cargar el perfil', error);
    } finally {
      this.cargando.set(false);
    }
  }
}