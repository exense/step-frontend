import { Directive, ElementRef, inject, input, untracked } from '@angular/core';
import { KeyValue } from '@angular/common';

@Directive({
  selector: '[stepCalcElementWidth]',
})
export class CalcElementWidthDirective {
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly variableName = input.required<string>({ alias: 'stepCalcElementWidth' });

  get widthInfo(): KeyValue<string, string> {
    const variableName = untracked(() => this.variableName());
    const elementWidth = this._el.nativeElement.getBoundingClientRect().width;
    const key = `--${variableName}`;
    const value = elementWidth ? `${elementWidth}px` : '';
    return { key, value };
  }
}
