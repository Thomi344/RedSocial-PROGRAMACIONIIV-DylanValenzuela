import { Injectable,signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable,tap} from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'https://greenpoint-back.onrender.com/autenticacion'; // --- URL base del backend para autenticación

  // --- Estados globales reactivos ---
  estaLogeado = signal<boolean>(false);
  usuarioActual = signal<any>(null);
  // --- SEÑAL PARA EL MODAL DE TIEMPO ---
  mostrarModalRefrescar = signal<boolean>(false);
  private avisoTimeoutId: any;
  constructor(private http: HttpClient) {
    // --- Al iniciar el servicio, chequeamos si hay una sesión guardada en localStorage ---
    this.chequearSesionGuardada();
  }
  // ⏱️ TIEMPOS DEL RELOJ
  //(Avisa a los 10 minutos):
  // private readonly TIEMPO_AVISO = 10 * 60 * 1000; 
  // Avisa a los 40 segundos (para pruebas):
  private readonly TIEMPO_AVISO = 40 * 1000;

  private chequearSesionGuardada() {
    const token = localStorage.getItem('token_greenpoint');
    const usuario = localStorage.getItem('usuario_greenpoint');

    if (token && usuario) {
      this.usuarioActual.set(JSON.parse(usuario));
      this.estaLogeado.set(true);
      this.iniciarTemporizador();
    }
  }
  // --- LÓGICA DEL TEMPORIZADOR ---
    iniciarTemporizador() {
      this.limpiarTemporizador(); // Resetea si ya había uno
      
      if (!this.obtenerToken()) return;

      // A los 10 minutos (o 40 seg en test), dispara el modal
      this.avisoTimeoutId = setTimeout(() => {
        this.mostrarModalRefrescar.set(true);
      }, this.TIEMPO_AVISO);
    }

    limpiarTemporizador() {
      if (this.avisoTimeoutId) {
        clearTimeout(this.avisoTimeoutId);
      }
      this.mostrarModalRefrescar.set(false);
    }
  // --- Función  de Registro  ---
  registrarUsuario(datosRegistro: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, datosRegistro);
  }

// --- Función de Login ---
  loginUsuario(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales).pipe(
      tap((respuesta: any) => {
        // --- Si el backend responde con un token, lo guardamos en localStorage y actualizamos el estado global ---
        if (respuesta.token) {
          localStorage.setItem('token_greenpoint', respuesta.token);
          // --- Si el backend también devuelve información del usuario, la guardamos ---
          if (respuesta.usuario) {
            localStorage.setItem('usuario_greenpoint', JSON.stringify(respuesta.usuario));
            this.usuarioActual.set(respuesta.usuario);
          }
          
          this.estaLogeado.set(true);
          this.iniciarTemporizador();
        }
      })
    );
  }

  // --- Cerrar Sesión ---
  cerrarSesion() {
    localStorage.removeItem('token_greenpoint');
    localStorage.removeItem('usuario_greenpoint');
    this.usuarioActual.set(null);
    this.estaLogeado.set(false);
    this.limpiarTemporizador();
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token_greenpoint');
  }

// --- Validar Token al inicio ---
  validarToken(): Observable<any> {
    const token = this.obtenerToken();
    return this.http.post(`${this.apiUrl}/autorizar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(tap(()=>this.iniciarTemporizador()));// Reinicia el reloj si la app valida OK al abrir
  }

  // --- Refrescar Token  ---
  refrescarToken(): Observable<any> {
    const token = this.obtenerToken();
    return this.http.post(`${this.apiUrl}/refrescar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((respuesta: any) => {
        if (respuesta.token) {
          localStorage.setItem('token_greenpoint', respuesta.token);
          this.iniciarTemporizador();
        }
      })
    );
  }
}
