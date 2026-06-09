import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { confirmarClaveValidator } from '../../validators/clave.validator';
// --- Auth ---
import { Auth } from '../../servicios/auth';
import { firstValueFrom } from 'rxjs'; 

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit {
  
  // --- Declaracion del formulario reactivo ---
  miFormulario!: FormGroup;
  
  // --- Variables de estado con signals para la interfaz grafica ---
  mostrarModal = signal<boolean>(false);
  mensajeModal = signal<string>('');
  esError = signal<boolean>(false);
  cargando = signal<boolean>(false);

  // --- Archivo binario de la imagen seleccionado temporalmente ---
  fotoTemporal: File | null = null;

  constructor(
    private router: Router,
    private authService: Auth // --- Inyectamos el servicio de autenticación ---
  ) {}

  ngOnInit(): void {
    // --- Inicializacion del formulario con sus validaciones sincronicas ---
    this.miFormulario = new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      apellido: new FormControl('', [Validators.required]),
      correo: new FormControl('', [Validators.required, Validators.email]),
      nombreUsuario: new FormControl('', [Validators.required]),
      fechaNacimiento: new FormControl('', [Validators.required]),
      descripcion: new FormControl('', [Validators.maxLength(250)]),
      clave: new FormControl('', [
        Validators.required, 
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]),
      repiteClave: new FormControl('', [Validators.required])
    }, { validators: confirmarClaveValidator() });
  }

  // --- Getters para acceder a los controles del formulario desde el html ---
  get nombre() { return this.miFormulario.get('nombre'); }
  get apellido() { return this.miFormulario.get('apellido'); }
  get correo() { return this.miFormulario.get('correo'); }
  get nombreUsuario() { return this.miFormulario.get('nombreUsuario'); }
  get fechaNacimiento() { return this.miFormulario.get('fechaNacimiento'); }
  get descripcion() { return this.miFormulario.get('descripcion'); }
  get clave() { return this.miFormulario.get('clave'); }
  get repiteClave() { return this.miFormulario.get('repiteClave'); }

  // --- Captura el archivo binario cuando el usuario lo selecciona ---
  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fotoTemporal = file;
    }
  }

  // --- Metodo principal para manejar el envio del formulario ---
  async enviarForm() {
    this.miFormulario.markAllAsTouched();

    if (this.miFormulario.invalid) {
      if (this.miFormulario.hasError('clavesNoIguales')) {
        this.abrirModal('Las contraseñas no coinciden.', true);
      }
      return;
    }

    if (!this.fotoTemporal) {
      this.abrirModal('Por favor, selecciona una imagen de perfil.', true);
      return;
    }

    // --- Activamos el spinner de carga general ---
    this.cargando.set(true);

    try {
      // --- FormData (caja fuerte para archivos y texto) ---
      const formData = new FormData();
      
      // campos de texto
      formData.append('nombre', this.miFormulario.value.nombre + ' ' + this.miFormulario.value.apellido);
      formData.append('nombreUsuario', this.miFormulario.value.nombreUsuario);
      formData.append('email', this.miFormulario.value.correo);
      formData.append('contrasena', this.miFormulario.value.clave);
      
      // Agrega el archivo
      formData.append('foto', this.fotoTemporal);

      console.log('Enviando FormData a NestJS...');

      // --- Manda TODO junto al backend ---
      const respuestaBackend = await firstValueFrom(this.authService.registrarUsuario(formData));
      
      // --- 3. Si todo salió bien, limpiamos y mostramos el éxito ---
      console.log('Respuesta del servidor:', respuestaBackend);
      this.miFormulario.reset();
      this.fotoTemporal = null;
      this.abrirModal('¡Usuario registrado con éxito en la base de datos!', false);

    } catch (err: any) {
      // Captura el mensaje de error real que nos manda NestJS
      const mensajeError = err.error?.message || 'Ocurrió un error al conectar con el servidor.';
      this.abrirModal(mensajeError, true);
      console.error('Error crítico:', err);
      this.cargando.set(false);
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
    if (!this.esError()) {
      this.router.navigate(['/login']);
    }
  }
}