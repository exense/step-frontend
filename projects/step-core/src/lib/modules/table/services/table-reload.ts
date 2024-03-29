import { Observable } from 'rxjs';

export abstract class TableReload {
  abstract reload(): void;
  abstract readonly loadComplete$: Observable<void>;
}
