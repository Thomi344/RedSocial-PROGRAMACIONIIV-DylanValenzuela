import { Directive, ElementRef, HostListener, Renderer2,OnInit } from '@angular/core';

@Directive({
  selector: '[appHoverAnimado]',
})
export class HoverAnimado  {
  constructor(private el: ElementRef, private renderer: Renderer2) {}
  // --- Escucha el evento de mouseenter para aplicar la animación de escala ---
  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1.02)');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.2s ease-in-out');
  }
  // --- Escucha el evento de mouseleave para revertir la animación de escala ---
  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');
  }
}
