import { Directive, effect, ElementRef, inject, input, Input, InputSignal, Renderer2 } from '@angular/core';

@Directive({
  selector: '[stepTestId]',
})
export class TestDataIdDirective {
  testDataId: InputSignal<string | undefined> = input<string | undefined>();

  private _el = inject(ElementRef);
  private renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      const value = this.testDataId();
      if (value !== undefined) {
        this.renderer.setAttribute(this._el.nativeElement, 'data-step-testid', value);
      }
    });
  }
}
