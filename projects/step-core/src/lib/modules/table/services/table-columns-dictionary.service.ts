import { Signal } from '@angular/core';
import { ColumnInfo } from '../types/column-info';

export abstract class TableColumnsDictionaryService {
  abstract readonly columnsDictionary: Signal<ColumnInfo[]>;
}
