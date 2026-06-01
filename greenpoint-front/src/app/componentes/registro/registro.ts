import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // ---  httpclient para pegarle a cloudinary ---
import { confirmarClaveValidator } from '../../validators/clave.validator';
import { environment } from '../../environments/environment';
// --- Auth ---
import { Auth } from '../../servicios/auth';
import {firstValueFrom} from 'rxjs'; // --- Para convertir el Observable del servicio Auth a Promesa y usar async/await ---
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
    private http: HttpClient, // --- Inyectamos el servicio http ---
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

  // --- Sube la imagen a Cloudinary usando Unsigned Uploads ---
  async subirACloudinary(file: File): Promise<string> {
    const urlCloudinary = `https://api.cloudinary.com/v1_1/${environment.cloudinaryCloudName}/image/upload`;
    
    // --- Cloudinary requiere un formato FormData para recibir archivos ---
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinaryPreset);

    // --- Convertimos el Observable de Angular a Promesa para manejarlo con async/await ---
    const respuesta: any = await this.http.post(urlCloudinary, formData).toPromise();
    
    // --- Devolvemos la url segura en formato string que nos da la nube ---
    return respuesta.secure_url;
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
      // --- 1. Sube primero la foto a la nube de forma transparente ---
      const urlDeLaImagen = await this.subirACloudinary(this.fotoTemporal);

      // --- 2. Arma el JSON mapeando los nombres EXACTOS que pide tu NestJS ---
      const datosParaBackend = {
        nombre: this.miFormulario.value.nombre + ' ' + this.miFormulario.value.apellido, // nombre y apellido
        nombreUsuario: this.miFormulario.value.nombreUsuario,
        email: this.miFormulario.value.correo, 
        contrasena: this.miFormulario.value.clave, 
        fotoPerfil: urlDeLaImagen 
      };

      console.log('Enviando a NestJS...', datosParaBackend);

      // --- 3. Enviam los datos al backend y espera la respuesta ---
      // Usamos firstValueFrom para convertir el Observable del AuthService en Promesa
      const respuestaBackend = await firstValueFrom(this.authService.registrarUsuario(datosParaBackend));
        // --- 4. Si todo salió bien, limpiamos y mostramos el éxito ---
        console.log('Respuesta del servidor:', respuestaBackend);
        this.miFormulario.reset();
        this.fotoTemporal = null;
        this.abrirModal('¡Usuario registrado con éxito en la base de datos!', false);

      } catch (err: any) {
        // Captura el mensaje de error real que nos manda NestJS (ej: "El correo ya existe")
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