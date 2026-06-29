import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'recortarTexto',
})
export class RecortarTextoPipe implements PipeTransform {
  transform(value: string, limite: number = 100): String {
    //--- Si el valor es nulo o indefinido, devuelve una cadena vacía ---
    if (!value) return '';
    //--- Si el valor es menor o igual al límite, devuelve el valor completo ---
    if (value.length <= limite) {
      return value;
    }
    //--- Si el valor es mayor al límite, recorta y agrega '...' al final ---
    return value.substring(0, limite) + '...';
  }
}
