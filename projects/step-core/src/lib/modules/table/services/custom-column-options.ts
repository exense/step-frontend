import { Observable } from 'rxjs';

export abstract class CustomColumnOptions {
  abstract readonly options$: Observable<string[]>;
}
