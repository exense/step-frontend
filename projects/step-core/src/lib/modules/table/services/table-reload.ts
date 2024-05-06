import { Observable } from 'rxjs';

export abstract class TableReload {
  abstract reload(): void;
}
