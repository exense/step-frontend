import { Directive, ElementRef, inject, Input } from '@angular/core';

@Directive({
  selector: '[testDataId]',
})
export class TestDataIdDirective {
  @Input('testDataId') testDataId: string | undefined;

  private _el = inject<ElementRef<HTMLElement>>(ElementRef);

  ngOnInit() {
    this._el.nativeElement.setAttribute('data-testid', this.testDataId);
  }
}
