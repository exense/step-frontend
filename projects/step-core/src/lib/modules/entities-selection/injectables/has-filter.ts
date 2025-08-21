import { Observable } from 'rxjs';
import { Signal } from '@angular/core';

export abstract class HasFilter {
  abstract readonly hasFilter$: Observable<boolean>;
  abstract readonly hasFilter: Signal<boolean>;
}
