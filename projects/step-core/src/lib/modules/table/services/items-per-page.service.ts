import { Observable } from 'rxjs';

export abstract class ItemsPerPageService {
  abstract getItemsPerPage(): Observable<number[]>;
  abstract getDefaultPageSizeItem(): Observable<number>;
}
