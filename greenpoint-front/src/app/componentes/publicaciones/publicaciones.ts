import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PublicacionCard } from '../publicacion-card/publicacion-card'; 
import { Publicaciones as PublicacionesService } from '../../servicios/publicaciones';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, PublicacionCard, ReactiveFormsModule],
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
  limitePorPagina = 10; // Cuántos posteos traemos por vez

  // --- Estado del Modal de Crear Posteo ---
  mostrarModalCrear = signal<boolean>(false);
  creandoPost = signal<boolean>(false);
  postForm: FormGroup;
  archivoSeleccionado = signal<File | null>(null);
  previewImagen = signal<string | null>(null);

  // --- Estados del Modal de Error ---
  mostrarModalError = signal<boolean>(false);
  mensajeError = signal<string>('');

  // --- Inyectamos los servicios respetando tu estructura ---
  constructor(
    private publicacionesService: PublicacionesService,
    private fb: FormBuilder
  ) {
    // Inicializamos el formulario con validaciones básicas
    this.postForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.maxLength(300)]]
    });
  }

  ngOnInit(): void {
    this.cargarPublicaciones(true);
  }

  // --- Método principal para buscar los datos ---
  async cargarPublicaciones(esNuevaCarga: boolean = false) {
    if(esNuevaCarga) {
      this.paginaActual.set(1);
      this.publicaciones.set([]);
    }
    this.cargando.set(true);

  try {
      // --- Usa firstValueFrom para convertir el Observable en una Promesa y esperar su resultado ---
      const nuevosPosteos = await firstValueFrom(
        this.publicacionesService.obtenerPublicaciones(
          this.ordenActual(),
          this.paginaActual(),
          this.limitePorPagina
        )
      );

      // --- Si es una nueva carga, reemplazamos todo. Si es una carga adicional (paginación), concatenamos ---
      this.publicaciones.update(actuales => [...actuales, ...nuevosPosteos]);

      // ---- Si el número de posteos recibidos es menor al límite, asume que no hay más páginas ---
      this.hayMasPaginas.set(nuevosPosteos.length === this.limitePorPagina);

    } catch (error) {
      console.error('Error al cargar publicaciones de la base de datos:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // --- Botones de Ordenamiento ---
  cambiarOrden(nuevoOrden: 'fecha' | 'likes') {
    if (this.ordenActual() === nuevoOrden) return; // Si ya está en ese orden, no hace nada
    
    this.ordenActual.set(nuevoOrden);
    this.cargarPublicaciones(true);
  }

  // --- Botón de "Cargar más" ---
  cargarMas() {
    if (this.hayMasPaginas() && !this.cargando()) {
      this.paginaActual.update(p => p + 1);
      // Pasamos 'false' para que NO limpie la lista, sino que sume los nuevos posteos al final
      this.cargarPublicaciones(false);
    }
  }

  // --- Lógica del Modal y Formulario de Creación ---
  abrirModalCrear() {
    this.mostrarModalCrear.set(true);
  }

  cerrarModalCrear() {
    if (this.creandoPost()) return; // Evita cerrar si se está subiendo el posteo
    this.mostrarModalCrear.set(false);
    this.postForm.reset();
    this.archivoSeleccionado.set(null);
    this.previewImagen.set(null);
  }

  // --- Lógica del Modal de Error ---
  cerrarModalError() {
    this.mostrarModalError.set(false);
  }

  // --- Atrapa la imagen cuando el usuario la selecciona ---
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.archivoSeleccionado.set(file);
      
      // Creamos una URL temporal para mostrar la vista previa en el HTML
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewImagen.set(e.target.result as string);
      reader.readAsDataURL(file);
    }
  }

  // --- Enviar el formulario al Backend ---
  async crearPost() {
    if (this.postForm.invalid) return;

    this.creandoPost.set(true);

    // --- Preparamos un FormData porque puede incluir un archivo de imagen ---
    const formData = new FormData();
    formData.append('titulo', this.postForm.get('titulo')?.value);
    formData.append('descripcion', this.postForm.get('descripcion')?.value);
    
    if (this.archivoSeleccionado()) {
      formData.append('imagen', this.archivoSeleccionado() as Blob);
    }

    try {
      await firstValueFrom(this.publicacionesService.crearPublicacion(formData));
      this.creandoPost.set(false);
      this.cerrarModalCrear();
      // Refrescamos el feed para ver el nuevo posteo arriba de todo
      this.cargarPublicaciones(true); 
    } catch (error) {
      console.error('Error al crear publicación', error);
      this.mensajeError.set('Hubo un error al crear el posteo. Revisa tu conexión.');
      this.mostrarModalError.set(true);
    } finally {
      this.creandoPost.set(false);
    }
  }
}