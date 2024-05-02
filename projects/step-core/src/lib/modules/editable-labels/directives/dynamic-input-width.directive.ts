import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[dynamicInputWidth]',
  standalone: true,
})
export class DynamicInputWidthDirective implements OnInit {
  @Input() text: string | undefined;
  @Input() minWidth = 20;

  constructor(private el: ElementRef<HTMLInputElement>) {}

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
      this.el.nativeElement.style.width = `${length + 2}ch`;
    } else {
      this.el.nativeElement.style.width = `${this.minWidth}ch`;
    }
  }
}