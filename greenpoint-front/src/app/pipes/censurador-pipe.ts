import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'censurador',
})
export class CensuradorPipe implements PipeTransform {
  private palabrasProhibidas = ['puto', 'putita', 'tonto', 'bobo', 'mierda','pendejo','pendeja','idiota','estupido','estupida','imbecil','imbeciles','tarado','tarada','boludo','boluda'];
  transform(value: string): string {
    //--- Si el valor es nulo o indefinido, devuelve una cadena vacía ---
    if (!value) return '';

    let textoFiltrado = value;
    // --- Recorre la lista de palabras prohibidas y reemplaza cada una con asteriscos ---
    this.palabrasProhibidas.forEach(palabra => {
      // Expresión regular para buscar la palabra sin importar mayúsculas/minúsculas
      const regex = new RegExp(`\\b${palabra}\\b`, 'gi');
      const asteriscos = '*'.repeat(palabra.length);
      textoFiltrado = textoFiltrado.replace(regex, asteriscos);
    });

    return textoFiltrado;
  }
}
