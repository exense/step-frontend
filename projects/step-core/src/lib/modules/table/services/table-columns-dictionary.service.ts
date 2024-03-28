import { Signal } from '@angular/core';

export abstract class TableColumnsDictionaryService {
  abstract readonly columnsDictionary: Signal<Record<string, string | undefined>>;
}
