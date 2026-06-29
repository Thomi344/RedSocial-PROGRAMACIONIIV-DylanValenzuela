import { Directive, HostListener, Input, Renderer2, ElementRef } from '@angular/core';

@Directive({
  selector: '[appCopiarEnlace]',
})
export class CopiarEnlace {
  @Input('appCopiarEnlace') enlaceACopiar: string = '';
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click') onClick() {
    if(!this.enlaceACopiar)return;

    // --- Usa la API del portapapeles para copiar el enlace al portapapeles del usuario---
    navigator.clipboard.writeText(this.enlaceACopiar).then(() => {
      
    // --- Aplica un efecto visual para indicar que el enlace ha sido copiado ---
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.5');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'opacity 0.2s');
      
    setTimeout(() => {
        this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
    }, 300);

    }).catch(err => {
      console.error('No se pudo copiar el texto: ', err);
    });    
  }
}
