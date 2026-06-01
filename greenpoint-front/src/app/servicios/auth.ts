import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:3000/autenticacion';

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
