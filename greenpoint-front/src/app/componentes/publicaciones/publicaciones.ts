import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
// Acá importaremos el componente hijo que creamos recién (ajustá la ruta si es distinta)
import { PublicacionCard } from '../publicacion-card/publicacion-card'; 

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, PublicacionCard],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  
  // --- Estado de la vista ---
  publicaciones = signal<any[]>([]); // Acá guardaremos los posteos que lleguen del back
  cargando = signal<boolean>(true);
  
  // --- Filtros y Paginación ---
  ordenActual = signal<'fecha' | 'likes'>('fecha');
  paginaActual = signal<number>(1);
  hayMasPaginas = signal<boolean>(true); // Para deshabilitar el botón "Siguiente"
  limitePorPagina = 5; // Cuántos posteos traemos por vez

  constructor() {}

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  // --- Método principal para buscar los datos (Simulado por ahora) ---
  cargarPublicaciones() {
    this.cargando.set(true);
    console.log(`Buscando posteos... Página: ${this.paginaActual()}, Orden: ${this.ordenActual()}`);
    
    // TODO: Acá llamaremos al servicio que se conecta con NestJS
    // this.publicacionesService.obtenerPublicaciones(...)

    setTimeout(() => {
        this.cargando.set(false); // Simulamos que ya cargó
    }, 500);
  }

  // --- Botones de Ordenamiento ---
  cambiarOrden(nuevoOrden: 'fecha' | 'likes') {
    if (this.ordenActual() === nuevoOrden) return; // Si ya está en ese orden, no hace nada
    
    this.ordenActual.set(nuevoOrden);
    this.paginaActual.set(1); // Si cambia el orden, volvemos a la página 1
    this.publicaciones.set([]); // Limpiamos la vista
    this.cargarPublicaciones();
  }

  // --- Botones de Paginación ---
  paginaSiguiente() {
    this.paginaActual.update(p => p + 1);
    this.cargarPublicaciones();
  }

  paginaAnterior() {
    if (this.paginaActual() > 1) {
      this.paginaActual.update(p => p - 1);
      this.cargarPublicaciones();
    }
  }
}