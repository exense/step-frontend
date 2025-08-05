import { inject, Pipe, PipeTransform } from '@angular/core';
import { ArrayItemLabelValueExtractor } from '../injectables/array-item-label-value-extractor';

@Pipe({
  name: 'arrayItemLabel',
  standalone: false,
})
export class ArrayItemLabelPipe<T> implements PipeTransform {
  private _extractor = inject(ArrayItemLabelValueExtractor, { optional: true });

  transform(item: T): string {
    return this._extractor?.getLabel(item) ?? (item as string).toString();
  }
}
