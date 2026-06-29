import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
})
export class AutoFocus implements AfterViewInit {
  constructor(private el: ElementRef) {}

  // --- Después de que la vista se haya inicializado, establece el foco en el elemento ---
  ngAfterViewInit() {
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, 200);
  }
}
