import { InjectionToken } from '@angular/core';
import { KeyValue } from '@angular/common';
import { ArrayItemLabelValueExtractor } from './array-item-label-value-extractor';

export const ARRAY_KEY_VALUE_LABEL_VALUE_EXTRACTOR = new InjectionToken<
  ArrayItemLabelValueExtractor<KeyValue<unknown, string>>
>('Extractor for key value items', {
  providedIn: 'root',
  factory: () => ({
    getValue: (item: KeyValue<unknown, string>) => item.key,
    getLabel: (item: KeyValue<unknown, string>) => item.value,
  }),
});
