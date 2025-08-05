import { inject, Pipe, PipeTransform } from '@angular/core';
import { DragDataService } from '../injectables/drag-data.service';
import { map, Observable, of } from 'rxjs';

@Pipe({
  name: 'isDragData',
})
export class IsDragDataPipe implements PipeTransform {
  private _dragDataService = inject(DragDataService, { optional: true });

  transform(data: unknown): Observable<boolean> {
    if (!data || !this._dragDataService) {
      return of(false);
    }
    return this._dragDataService.dragData$.pipe(map((dragData) => dragData === data));
  }
}
