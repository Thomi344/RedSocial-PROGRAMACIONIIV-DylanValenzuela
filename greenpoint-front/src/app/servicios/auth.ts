import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'https://greenpoint-back.onrender.com/autenticacion'; // --- URL base del backend para autenticación

  constructor(private http: HttpClient) {}

  // --- Función  de Registro  ---
  registrarUsuario(datosRegistro: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, datosRegistro);
  }

  // --- Función  de Login  ---
  loginUsuario(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }
}
