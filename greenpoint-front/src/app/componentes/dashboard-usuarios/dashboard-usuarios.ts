import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuarios } from '../../servicios/usuarios';
import { confirmarClaveValidator } from '../../validators/clave.validator';
import { fechaPasadaValidator } from '../../validators/fecha.validator';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-dashboard-usuarios',
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.css',
})
export class DashboardUsuarios implements OnInit {
  
  private usuariosService = inject(Usuarios);

  usuarios = signal<any[]>([]);
  cargando = signal<boolean>(true);
  
  // --- Variables de estado con signals para la interfaz grafica (Modales) ---
  mostrarModal = signal<boolean>(false);
  mensajeModal = signal<string>('');
  esError = signal<boolean>(false);

  formularioRegistro: FormGroup;

  constructor() {
    this.formularioRegistro = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(18), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]),
      apellido: new FormControl('', [Validators.required, Validators.maxLength(18), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]),
      correo: new FormControl('', [Validators.required, Validators.email]),
      nombreUsuario: new FormControl('', [Validators.required]),
      fechaNacimiento: new FormControl('', [Validators.required, fechaPasadaValidator()]),
      descripcion: new FormControl('', [Validators.maxLength(250)]),
      clave: new FormControl('', [
        Validators.required, 
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]),
      repiteClave: new FormControl('', [Validators.required]),
      rol: new FormControl('usuario', [Validators.required])
    }, { validators: confirmarClaveValidator() });
  }
  
  // --- Getters para acceder a los controles del formulario desde el html ---
  get nombre() { return this.formularioRegistro.get('nombre'); }
  get apellido() { return this.formularioRegistro.get('apellido'); }
  get correo() { return this.formularioRegistro.get('correo'); }
  get nombreUsuario() { return this.formularioRegistro.get('nombreUsuario'); }
  get fechaNacimiento() { return this.formularioRegistro.get('fechaNacimiento'); }
  get descripcion() { return this.formularioRegistro.get('descripcion'); }
  get clave() { return this.formularioRegistro.get('clave'); }
  get repiteClave() { return this.formularioRegistro.get('repiteClave'); }

  ngOnInit() {
    this.cargarUsuarios();
  }

  // --- Función para cargar la lista de usuarios ---
  cargarUsuarios() {
      this.cargando.set(true);
      this.usuariosService.obtenerTodosUsuarios().subscribe({
        next: (data) => {
          this.usuarios.set(data);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('Error al cargar la lista de usuarios', err);
          this.cargando.set(false);
        }
      });
  }

  // --- Función para crear un nuevo usuario ---
  crearUsuario() {
    this.formularioRegistro.markAllAsTouched();

    if (this.formularioRegistro.invalid) {
      // --- Si hay error de contraseñas, mostramos el modal ---
      if (this.formularioRegistro.hasError('clavesNoIguales')) {
        this.abrirModal('Las contraseñas no coinciden.', true);
      }
      return;
    }

    const valores = this.formularioRegistro.value;

    // --- Prepara los datos para enviarlos al backend ---
    const datosParaBackend = {
      nombre: `${valores.nombre} ${valores.apellido}`,
      nombreUsuario: valores.nombreUsuario,
      email: valores.correo,
      contrasena: valores.clave,
      fechaNacimiento: valores.fechaNacimiento,
      descripcion: valores.descripcion,
      rol: valores.rol
    };

    // --- Activa el spinner de carga ---
    this.cargando.set(true);

    this.usuariosService.crearUsuario(datosParaBackend).subscribe({
      next: () => {
        // --- Limpiamos el formulario y recargamos la lista de usuarios ---
        this.formularioRegistro.reset({ rol: 'usuario' }); 
        this.cargarUsuarios(); // Recargamos la tabla para ver al nuevo
        this.abrirModal('¡Usuario registrado con éxito en la base de datos!', false);
      },
      error: (err) => {
        // Captura el mensaje de error real 
        const mensajeError = err.error?.message || 'Ocurrió un error al conectar con el servidor.';
        this.abrirModal(mensajeError, true);
        console.error('Error al crear el usuario', err);
        this.cargando.set(false);
      }
    });
  }

  // --- Función para cambiar el estado de un usuario (activar/desactivar) ---
  cambiarEstadoUsuario(usuario: any) {
    if (usuario.activo) {
      this.usuariosService.desactivarUsuario(usuario._id).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => {
          this.abrirModal('Error al desactivar al usuario.', true);
          console.error('Error al desactivar', err);
        }
      });
    } else {
      this.usuariosService.activarUsuario(usuario._id).subscribe({
        next: () => this.cargarUsuarios(),
        error: (err) => {
          this.abrirModal('Error al activar al usuario.', true);
          console.error('Error al activar', err);
        }
      });
    }
  }

  // --- Control del modal ---
  abrirModal(mensaje: string, error: boolean) {
    this.mensajeModal.set(mensaje);
    this.esError.set(error);
    this.mostrarModal.set(true);
    this.cargando.set(false); 
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }
}