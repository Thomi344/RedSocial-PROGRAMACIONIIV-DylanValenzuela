import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  
  miFormulario!: FormGroup;
  
  // --- SIGNALS PARA EL CONTROL VISUAL DE LA INTERFAZ ---
  mostrarModal = signal<boolean>(false);
  mensajeModal = signal<string>('');
  esError = signal<boolean>(false);
  cargando = signal<boolean>(false);

  constructor(private router: Router) {}

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

    // --- ACTIVAMOS EL LOADER CON SIGNALS ---
    this.cargando.set(true);

    const { identificador, clave } = this.miFormulario.value;

    // --- SIMULACIÓN TEMPORAL HASTA CONECTAR CON LA API NESTJS ---
    setTimeout(() => {
      this.cargando.set(false);
      
      const loginExitoso = true; 

      if (!loginExitoso) {
        this.abrirModal('Credenciales incorrectas o usuario inexistente.', true);
      } else {
        this.abrirModal('¡Acceso concedido! Entrando a GreenPoint...', false);
      }
    }, 1500);
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