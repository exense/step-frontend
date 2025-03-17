import { InjectionToken } from '@angular/core';
import { ArrayItemLabelValueExtractor } from '@exense/step-core';
import { KeyValue } from '@angular/common';

export const ARRAY_KEY_VALUE_LABEL_VALUE_EXTRACTOR = new InjectionToken<
  ArrayItemLabelValueExtractor<KeyValue<unknown, string>>
>('Extractor for key value items', {
  providedIn: 'root',
  factory: () => ({
    getValue: (item: KeyValue<unknown, string>) => item.key,
    getLabel: (item: KeyValue<unknown, string>) => item.value,
  }),
});
