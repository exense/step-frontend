import { inject, Pipe, PipeTransform } from '@angular/core';
import { SelectionCollector } from '@exense/step-core';
import { map, Observable, of } from 'rxjs';

@Pipe({
  name: 'isSelected',
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
