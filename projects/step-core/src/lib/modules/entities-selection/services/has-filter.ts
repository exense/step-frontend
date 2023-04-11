import { Observable } from 'rxjs';

export abstract class HasFilter {
  abstract readonly hasFilter$: Observable<boolean>;
}
