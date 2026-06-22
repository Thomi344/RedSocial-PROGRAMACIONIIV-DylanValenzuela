import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Publicaciones {
  private http = inject(HttpClient);
  // --- URL base del backend para publicaciones ---
  private apiUrl = 'https://greenpoint-back.onrender.com/publicaciones';

  // --- Arma las cabeceras con el token de seguridad ---
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token_greenpoint');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // --- Obtener Publicaciones (GET) ---
  // --- Se puede ordenar por fecha o por popularidad, y se puede paginar ---
  obtenerPublicaciones(orden: string = 'fecha', pagina: number = 1, limite: number = 10, usuarioId?: string): Observable<any> {
    const offset = (pagina - 1) * limite;
    
    let params = new HttpParams()
      .set('orden', orden)
      .set('offset', offset.toString())
      .set('limit', limite.toString());

    if (usuarioId) {
      params = params.set('usuarioId', usuarioId);
    }

    return this.http.get(this.apiUrl, { params });
  }
  // --- Crear Publicación (POST) ---
  // Recibe un FormData porque puede incluir un archivo de imagen
  crearPublicacion(datosFormulario: FormData): Observable<any> {
    return this.http.post(this.apiUrl, datosFormulario, { headers: this.getHeaders() });
  }

  // --- Eliminar Publicación (DELETE) ---
  eliminarPublicacion(idPublicacion: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idPublicacion}`, { headers: this.getHeaders() });
  }

  // --- Dar Me Gusta (POST) ---
  darMeGusta(idPublicacion: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idPublicacion}/like`, {}, { headers: this.getHeaders() });
  }

  // --- Quitar Me Gusta (DELETE) ---
  quitarMeGusta(idPublicacion: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idPublicacion}/like`, { headers: this.getHeaders() });
  }
  // --- Agregar Comentario (POST) ---
  agregarComentario(idPublicacion: string, texto: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idPublicacion}/comentarios`, { texto }, { headers: this.getHeaders() });
  }
  // --- Eliminar Comentario (DELETE) ---
  eliminarComentario(idPublicacion: string, idComentario: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idPublicacion}/comentarios/${idComentario}`, { headers: this.getHeaders() });
  }
// --- Traer Comentarios Paginados ---
  obtenerComentarios(idPublicacion: string, pagina: number = 1, limite: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idPublicacion}/comentarios?pagina=${pagina}&limite=${limite}`, { 
      headers: this.getHeaders() 
    });
  }

  // --- Editar Comentario ---
  editarComentario(idPublicacion: string, idComentario: string, texto: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idPublicacion}/comentarios/${idComentario}`, { texto }, { 
      headers: this.getHeaders() 
    });
  }
}
