import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Usuarios {
  constructor(private http: HttpClient) { }

  // --- URL base del backend para publicaciones ---
  private apiUrl = 'https://greenpoint-back.onrender.com/usuarios';

  // --- Arma las cabeceras con el token de seguridad ---
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token_greenpoint');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // --- 1. Traer los datos de Mi Perfil ---
  obtenerMiPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mi-perfil`, { headers: this.getHeaders() });
  }

  // --- 2. Actualizar Perfil (Maneja FormData porque hay imagen) ---
  actualizarPerfil(datos: FormData): Observable<any> {
    //--- Arma las cabeceras con el token de seguridad (sin Content-Type porque es FormData) ---
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token_greenpoint')}`
    });
    return this.http.put(`${this.apiUrl}/actualizar`, datos, { headers });
  }

  // --- 3. Traer datos de otro usuario ---
  obtenerUsuario(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

