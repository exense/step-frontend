import { computed, contentChildren, Directive } from '@angular/core';
import { MatOption } from '@angular/material/autocomplete';
import { KeyValue } from '@angular/common';

export interface ExtraOption<T> extends KeyValue<T, string> {
  className?: string;
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'step-select-extra-options',
  standalone: false,
})
export class SelectExtraOptionsDirective<T> {
  private matOptions = contentChildren(MatOption<T>);

  readonly items = computed<ExtraOption<T>[]>(() => {
    const matOptions = this.matOptions() as MatOption<T>[];
    return matOptions.map((item) => {
      const key = item.value;
      const value = item.viewValue;
      const className = item._getHostElement()?.className;
      return { key, value, className };
    });
  });
}
