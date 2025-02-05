import { Directive, ElementRef, HostListener, inject, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[dynamicInputWidth]',
})
export class DynamicInputWidthDirective implements OnInit {
  private _el = inject<ElementRef<HTMLInputElement>>(ElementRef);

  @Input() text: string | undefined;
  @Input() minWidth = 20;

  ngOnInit() {
    this.resizeInput(this.text);
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    this.resizeInput(value);
  }

  private resizeInput(value?: string): void {
    const length = value?.length;
    if (length && length > 20) {
      this._el.nativeElement.style.width = `${length + 2}ch`;
    } else {
      this._el.nativeElement.style.width = `${this.minWidth}ch`;
    }
  }
}
