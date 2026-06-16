import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
// --- Auth ---
import { Auth } from '../../servicios/auth';
import {firstValueFrom} from 'rxjs'; // --- Para convertir el Observable del servicio Auth a Promesa y usar async/await ---
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  
  miFormulario!: FormGroup;
  
  // --- SIGNALS ---
  mostrarModal = signal<boolean>(false);
  mensajeModal = signal<string>('');
  esError = signal<boolean>(false);
  cargando = signal<boolean>(false);

  constructor(private router: Router,private authService: Auth) {}

  ngOnInit(): void {
    this.miFormulario = new FormGroup({
      // --- ACEPTA CORREO O NOMBRE DE USUARIO ---
      identificador: new FormControl('', [Validators.required]),
      // --- VALIDACIÓN: 8 CARACTERES, 1 MAYÚSCULA, 1 NÚMERO ---
      clave: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/) 
      ])
    });
  }

  get identificador() { return this.miFormulario.get('identificador'); }
  get clave() { return this.miFormulario.get('clave'); }

  // --- MÉTODO DE ACCESO RÁPIDO PARA TESTING ---
  loginRapido(usuarioOCorreo: string, contrasena: string) {
    this.miFormulario.patchValue({
      identificador: usuarioOCorreo,
      clave: contrasena
    });
  }

  async enviarForm() {
    this.miFormulario.markAllAsTouched();

    if (this.miFormulario.invalid) {
      return;
    }

    // --- ACTIVA EL LOADER ---
    this.cargando.set(true);

    // --- MAPEO DE DATOS PARA EL BACKEND ---
    const datosBackend = {
      identificador: this.miFormulario.value.identificador, // Puede ser correo o nombre de usuario
      contrasena: this.miFormulario.value.clave
    };

    try {
      // --- LLAMADA A LA API ---
      const respuestaBackend = await firstValueFrom(this.authService.loginUsuario(datosBackend));
      
      console.log('Datos del usuario logueado:', respuestaBackend);
      
      // Apagamos el loader y mostramos éxito
      this.cargando.set(false);
      this.abrirModal('¡Acceso concedido! Entrando a GreenPoint...', false);

    } catch (err: any) {
      // Captura error 401 del backend ("Credenciales inválidas")
      const mensajeError = err.error?.message || 'Error de conexión con el servidor.';
      
      console.error('Error en login:', err);
      this.cargando.set(false);
      this.abrirModal(mensajeError, true);
    }
  }

  // --- CONTROL DEL MODAL CON SIGNALS ---
  abrirModal(mensaje: string, error: boolean) {
    this.mensajeModal.set(mensaje);
    this.esError.set(error);
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    
    if (!this.esError()) {
      this.router.navigate(['/publicaciones']);
    }
  }
}