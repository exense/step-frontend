import { KeyValue } from '@angular/common';

export type MultiLevelItem<T> = KeyValue<T, string> & { children?: MultiLevelItem<T>[] };
