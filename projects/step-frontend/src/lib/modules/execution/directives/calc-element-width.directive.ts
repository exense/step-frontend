import { contentChildren, Directive, ElementRef, inject, input, untracked } from '@angular/core';
import { KeyValue } from '@angular/common';
import { CalcElementWidthItemDirective } from './calc-element-width-item.directive';

@Directive({
  selector: '[stepCalcElementWidth]',
})
export class CalcElementWidthDirective {
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly variableName = input.required<string>({ alias: 'stepCalcElementWidth' });
  readonly additionalSize = input(0);
  readonly subItems = contentChildren(CalcElementWidthItemDirective);

  get widthInfo(): KeyValue<string, string> {
    const variableName = untracked(() => this.variableName());
    const elementWidth = this.calcWidth();
    const key = `--${variableName}`;
    const value = elementWidth ? `${elementWidth}px` : '';
    return { key, value };
  }

  private calcWidth(): number {
    const items = untracked(() => this.subItems());

    let result = untracked(() => this.additionalSize());

    if (items.length === 0) {
      result += this._el.nativeElement.getBoundingClientRect().width;
      return result;
    }

    items.forEach((item) => {
      result += item.width;
    });

    return result;
  }
}
