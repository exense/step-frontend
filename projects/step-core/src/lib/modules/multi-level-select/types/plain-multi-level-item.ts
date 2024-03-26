import { KeyValue } from '@angular/common';
export type PlainMultiLevelItem<T> = KeyValue<T, string> & { level: number; parent?: PlainMultiLevelItem<T> };
