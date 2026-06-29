import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoHace',
})
export class TiempoHacePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return 'Hace un momento';
    // --- Convierte el valor a un objeto Date ---
    const fechaPasada = new Date(value);
    const fechaActual = new Date();
    const diferenciaMs = fechaActual.getTime() - fechaPasada.getTime();
    //--- Calcula la diferencia en segundos, minutos, horas y días ---
    const segundos = Math.floor(diferenciaMs / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    //--- Devuelve un string representando el tiempo transcurrido ---
    if (segundos < 60) {
      return 'Hace un momento';
    } else if (minutos < 60) {
      return minutos === 1 ? 'Hace 1 minuto' : `Hace ${minutos} minutos`;
    } else if (horas < 24) {
      return horas === 1 ? 'Hace 1 hora' : `Hace ${horas} horas`;
    } else {
      return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`;
    }
  }

}
