import { InjectionToken } from '@angular/core';
import { ArrayItemLabelValueExtractor } from './array-item-label-value-extractor';

export const ARRAY_STRING_LABEL_VALUE_EXTRACTOR = new InjectionToken<ArrayItemLabelValueExtractor<string, string>>(
  'Extractor for simple strings items',
  {
    providedIn: 'root',
    factory: () => ({
      getValue: (item: string) => item,
      getLabel: (item: string) => item,
    }),
  },
);
