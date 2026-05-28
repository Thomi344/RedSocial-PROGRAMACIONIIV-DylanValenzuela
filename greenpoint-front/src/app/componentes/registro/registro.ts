import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { confirmarClaveValidator } from '../../validators/clave.validator';

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

  // --- Variable para guardar el archivo de imagen de perfil ---
  imagenSeleccionada = signal<File | null>(null);

  constructor(
    private router: Router
    // private authService: AuthService // --- Proximamente inyectaremos tu servicio de nestjs aca ---
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
    }, { validators: confirmarClaveValidator() }); // --- Validador personalizado a nivel de grupo ---
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

  // --- Metodo para capturar el input type file ---
  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada.set(file);
    }
  }

  // --- Metodo principal para manejar el envio del formulario ---
  async enviarForm() {
    // --- Marca todos los campos como tocados para disparar los mensajes rojos si el usuario intenta enviar vacio ---
    this.miFormulario.markAllAsTouched();

    // --- Si el formulario tiene errores cortamos la ejecucion ---
    if (this.miFormulario.invalid) {
      if (this.miFormulario.hasError('clavesNoIguales')) {
         this.abrirModal('Las contraseñas no coinciden.', true);
      }
      return;
    }

    // --- Validamos que haya subido una imagen obligatoriamente ---
    if (!this.imagenSeleccionada()) {
      this.abrirModal('Por favor, selecciona una imagen de perfil.', true);
      return;
    }

    // --- Activamos el spinner o texto de carga ---
    this.cargando.set(true);

    const datosRegistro = {
      ...this.miFormulario.value,
      imagen: this.imagenSeleccionada()
    };

    try {
      // --- Simulacion temporal hasta que conectemos el endpoint de nestjs ---
      setTimeout(() => {
         this.miFormulario.reset();
         this.abrirModal('¡Jugador registrado con exito! Bienvenido a la red social.', false);
      }, 1500);

    } catch (err) {
      // --- El catch atrapa errores de conexion graves ---
      this.abrirModal('Ocurrio un error inesperado de conexion.', true);
      console.error('Error critico en el registro:', err);
    }
  }

  // --- Metodo para abrir el modal con un mensaje especifico y un flag de error ---
  abrirModal(mensaje: string, error: boolean) {
    this.mensajeModal.set(mensaje);
    this.esError.set(error);
    this.mostrarModal.set(true);
    
    // --- Aseguramos que el estado de carga este apagado ---
    this.cargando.set(false); 
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    
    // --- Si no fue un error significa que se registro con exito y lo enviamos al login ---
    if (!this.esError()) {
      this.router.navigate(['/login']);
    }
  }
}