import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuarios } from '../../servicios/usuarios';
import { Publicaciones } from '../../servicios/publicaciones'; // Tu servicio de publicaciones
import {PublicacionCard} from '../publicacion-card/publicacion-card';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, ReactiveFormsModule, PublicacionCard],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  //private usuariosService = inject(UsuariosService);
  //private publicacionesService = inject(Publicaciones);
  private fb = inject(FormBuilder);
  constructor(private usuarios: Usuarios,private publicaciones: Publicaciones){}

  // --- Estados ---
  usuario = signal<any>(null);
  misPublicaciones = signal<any[]>([]);
  cargando = signal<boolean>(true);
  
  // --- Estados de Edición ---
  editando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  archivoSeleccionado = signal<File | null>(null);
  previewImagen = signal<string | null>(null);

  perfilForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });

  ngOnInit() {
    this.cargarDatos();
  }
  async cargarDatos() {
    this.cargando.set(true);
    try {
      // --- 1. Traemos los datos de Mi Perfil ---
      const datosUsuario = await firstValueFrom(this.usuarios.obtenerMiPerfil());
      this.usuario.set(datosUsuario);
      
      // --- Prellenamos el formulario con los datos actuales ---
      this.perfilForm.patchValue({
        nombre: datosUsuario.nombre,
        descripcion: datosUsuario.descripcion || ''
      });

      //-- 2. Traemos las publicaciones del usuario ---
      const misPosteos = await firstValueFrom(this.publicaciones.obtenerPublicaciones('fecha', 1, 50, datosUsuario._id))
      this.misPublicaciones.set(misPosteos.publicaciones || misPosteos.data || misPosteos);

    } catch (error) {
      console.error('Error al cargar perfil', error);
    } finally {
      this.cargando.set(false);
    }
  }

// --- Lógica de Edición ---
  toggleEdicion() {
    this.editando.set(true);
  }

  cancelarEdicion() {
    this.editando.set(false);
    this.archivoSeleccionado.set(null);
    this.previewImagen.set(null);
    // Restauramos valores originales
    this.perfilForm.patchValue({
      nombre: this.usuario().nombre,
      descripcion: this.usuario().descripcion || ''
    });
  }

  alSeleccionarArchivo(evento: any) {
    const archivo = evento.target.files[0];
    if (archivo) {
      this.archivoSeleccionado.set(archivo);
      // Creamos una URL temporal para mostrar la preview de la imagen
      const lector = new FileReader();
      lector.onload = (e: any) => this.previewImagen.set(e.target.result);
      lector.readAsDataURL(archivo);
    }
  }

  async guardarCambios() {
    if (this.perfilForm.invalid || this.guardando()) return;

    this.guardando.set(true);
    const formData = new FormData();
    formData.append('nombre', this.perfilForm.get('nombre')?.value);
    formData.append('descripcion', this.perfilForm.get('descripcion')?.value);
    
    if (this.archivoSeleccionado()) {
      // Si se seleccionó una nueva imagen, la agregamos al FormData
      formData.append('fotoPerfil', this.archivoSeleccionado() as Blob);
    }

    try {
      const res = await firstValueFrom(this.usuarios.actualizarPerfil(formData));
      const usuarioActualizado = res.usuario || res.data || res;
      this.usuario.set(usuarioActualizado); // Actualizamos la vista con los nuevos datos
      this.editando.set(false);
      this.archivoSeleccionado.set(null);
      this.previewImagen.set(null);
    } catch (error) {
      console.error('Error al actualizar perfil', error);
    } finally {
      this.guardando.set(false);
    }
  }
}

