import { inject, Pipe, PipeTransform } from '@angular/core';
import { SelectionCollector } from '../services/selection-collector/selection-collector';
import { map, Observable, of } from 'rxjs';

@Pipe({
  name: 'isSelected',
  standalone: false,
})
export class IsSelectedPipe implements PipeTransform {
  private _selectionCollector = inject(SelectionCollector, { optional: true });

  transform(value: unknown): Observable<boolean> {
    if (!this._selectionCollector) {
      return of(false);
    }
    return this._selectionCollector.selected$.pipe(map((selected) => selected.includes(value)));
  }
}
