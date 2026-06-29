import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../servicios/auth';
import { Publicaciones } from '../../servicios/publicaciones';
import { firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { TiempoHacePipe } from '../../pipes/tiempo-hace-pipe';
import { RecortarTextoPipe } from '../../pipes/recortar-texto-pipe';
import { CensuradorPipe } from '../../pipes/censurador-pipe';
import {CopiarEnlace} from '../../directivas/copiar-enlace';
import { HoverAnimado } from '../../directivas/hover-animado';
import { AutoFocus } from '../../directivas/auto-focus';
@Component({
  selector: 'app-publicacion-card',
  imports: [CommonModule,RouterLink,TiempoHacePipe,RecortarTextoPipe,CensuradorPipe,CopiarEnlace,HoverAnimado,AutoFocus],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css',
})
export class PublicacionCard implements OnInit {
  @Input() publicacion: any;
  @Input() vistaDetalle: boolean = false;
  
  private authService = inject(Auth);
  private publicacionesService = inject(Publicaciones);

  // --- Estado para manejar el "Me gusta" ---
  usuarioActual = this.authService.usuarioActual; // Es una Signal
  dioLike = signal<boolean>(false);
  cantidadLikes = signal<number>(0);
  estaCargandoLike = signal<boolean>(false);
  // --- Estados de Comentarios ---
  mostrarComentarios = signal<boolean>(false);
  nuevoComentario = signal<string>('');
  enviandoComentario = signal<boolean>(false);
  // --- Estado del Modal ---
  mostrarModalEliminar = signal<boolean>(false);
  estaEliminando = signal<boolean>(false);
  mostrarModalError = signal<boolean>(false);
  mensajeError = signal<string>('');
  // --- Modales específicos para comentarios ---
  mostrarModalEliminarComentario = signal<boolean>(false);
  estaEliminandoComentario = signal<boolean>(false);
  comentarioAEliminarId = signal<string>('');
  // --- Estados de Edición de Comentarios ---
  comentarioEnEdicionId = signal<string>('');
  textoEdicion = signal<string>('');
  guardandoEdicion = signal<boolean>(false);
  // --- Paginación de Comentarios ---
  comentariosVisibles = signal<any[]>([]);
  paginaComentarios = 1;
  totalComentarios = signal<number>(0);
  cargandoMas = signal<boolean>(false);
  // --- Estado de expansión del posteo ---
  expandido: boolean = false;

  ngOnInit() {
    this.cantidadLikes.set(this.publicacion.likes?.length || 0);
    this.totalComentarios.set(this.publicacion.comentarios?.length || 0);
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
  // --- Lógica de Comentarios ---

  async toggleComentarios() {
    this.mostrarComentarios.update(v => !v);
  // --- Si acabamos de abrir los comentarios y no hay comentarios cargados, traemos la primera página ---
    if (this.mostrarComentarios() && this.comentariosVisibles().length === 0 && this.totalComentarios() > 0) {
      await this.cargarMasComentarios(true);
    }
  }
  async cargarMasComentarios(primeraCarga = false) {
      if (this.cargandoMas()) return;
      this.cargandoMas.set(true);

      try {
        // Pedimos 5 comentarios por página
        const res = await firstValueFrom(this.publicacionesService.obtenerComentarios(this.publicacion._id, this.paginaComentarios, 5));
        
        if (primeraCarga) {
          this.comentariosVisibles.set(res.comentarios);
        } else {
          // Concatenamos los nuevos a los que ya teníamos
          this.comentariosVisibles.update(actuales => [...actuales, ...res.comentarios]);
        }
        
        this.totalComentarios.set(res.total);
        this.paginaComentarios++; // Preparamos la página para el próximo clic
      } catch (error) {
        console.error('Error al cargar paginación', error);
      } finally {
        this.cargandoMas.set(false);
      }
    }
  actualizarTextoComentario(evento: any) {
    this.nuevoComentario.set(evento.target.value);
  }

  async publicarComentario() {
    const texto = this.nuevoComentario().trim();
    if (!texto || this.enviandoComentario()) return;

    this.enviandoComentario.set(true);
    try {
      const res = await firstValueFrom(this.publicacionesService.agregarComentario(this.publicacion._id, texto));
      // Actualizamos la lista de comentarios localmente con lo que devuelve el back
      this.publicacion.comentarios = res.comentarios;
      this.totalComentarios.set(res.comentarios.length);
      // Reseteamos y volvemos a cargar la página 1 para ver el comentario nuevo arriba
      this.paginaComentarios = 1;
      await this.cargarMasComentarios(true);
      this.nuevoComentario.set('');
    } catch (error) {
      console.error('Error al comentar', error);
      this.mensajeError.set('Hubo un problema al publicar tu comentario.');
      this.mostrarModalError.set(true);
    } finally {
      this.enviandoComentario.set(false);
    }
  }
  // --- Modal: Eliminar Comentario ---
  abrirModalComentario(idComentario: string) {
    this.comentarioAEliminarId.set(idComentario);
    this.mostrarModalEliminarComentario.set(true);
  }

  cerrarModalComentario() {
    if (!this.estaEliminandoComentario()) {
      this.mostrarModalEliminarComentario.set(false);
      this.comentarioAEliminarId.set('');
    }
  }

  async confirmarEliminarComentario() {
    const idComentario = this.comentarioAEliminarId();
    if (!idComentario || this.estaEliminandoComentario()) return;

    this.estaEliminandoComentario.set(true);
    try {
      const res = await firstValueFrom(this.publicacionesService.eliminarComentario(this.publicacion._id, idComentario));
      this.publicacion.comentarios = res.comentarios;
      this.estaEliminandoComentario.set(false);
      this.cerrarModalComentario();
    } catch (error) {
      console.error('Error al eliminar comentario', error);
      this.cerrarModalComentario();
      this.mensajeError.set('No pudimos eliminar el comentario. Intentá de nuevo.');
      this.mostrarModalError.set(true);
    } finally {
      this.estaEliminandoComentario.set(false);
    }
  }

  puedeEliminarComentario(comentario: any): boolean {
    const user = this.usuarioActual();
    if (!user || !comentario.usuario) return false;
    // Es dueño del comentario o es administrador
    return comentario.usuario._id === user.id || user.perfil === 'administrador';
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
      this.estaEliminando.set(false);
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
    
    return this.publicacion.usuario._id === user.id || user.perfil === 'admin';
  }
  // --- Lógica de Edición ---
  puedeEditarComentario(comentario: any): boolean {
    const user = this.usuarioActual();
    if (!user || !comentario.usuario) return false;
    return comentario.usuario._id === user.id; // Solo el creador original puede editar
  }

  iniciarEdicion(comentario: any) {
    this.comentarioEnEdicionId.set(comentario._id);
    this.textoEdicion.set(comentario.texto);
  }

  cancelarEdicion() {
    this.comentarioEnEdicionId.set('');
    this.textoEdicion.set('');
  }

  actualizarTextoEdicion(evento: any) {
    this.textoEdicion.set(evento.target.value);
  }

  async guardarEdicion() {
    const texto = this.textoEdicion().trim();
    const idComentario = this.comentarioEnEdicionId();

    if (!texto || !idComentario || this.guardandoEdicion()) return;

    this.guardandoEdicion.set(true);
    try {
      const res = await firstValueFrom(this.publicacionesService.editarComentario(this.publicacion._id, idComentario, texto));
      // --- Actualizamos la lista de comentarios localmente con lo que devuelve el back ---
      this.publicacion.comentarios = res.comentarios; 
      this.cancelarEdicion();
    } catch (error) {
      console.error('Error al editar comentario', error);
      this.mensajeError.set('Hubo un problema al editar tu comentario.');
      this.mostrarModalError.set(true);
    } finally {
      this.guardandoEdicion.set(false);
    }
  }
}