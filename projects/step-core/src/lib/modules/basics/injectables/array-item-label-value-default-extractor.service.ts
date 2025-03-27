import { Injectable } from '@angular/core';
import { ArrayItemLabelValueExtractor } from './array-item-label-value-extractor';
import { KeyValue } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ArrayItemLabelValueDefaultExtractorService<T = unknown, V = unknown>
  implements ArrayItemLabelValueExtractor<T, V>
{
  getLabel(item: T): string {
    return this.toKeyValue(item).value;
  }

  getValue(item: T): V {
    return this.toKeyValue(item).key;
  }

  private toKeyValue(item: T): KeyValue<V, string> {
    if (typeof item === 'object') {
      if (item?.hasOwnProperty('key') && item?.hasOwnProperty('value')) {
        return item as unknown as KeyValue<V, string>;
      }
    }

    return {
      key: item as unknown as V,
      value: (item as unknown)?.toString() ?? '',
    };
  }
}
