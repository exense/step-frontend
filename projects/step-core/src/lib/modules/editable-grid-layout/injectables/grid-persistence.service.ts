import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, timer } from 'rxjs';
import { GridSessionStorageService } from './grid-session-storage.service';
import { WidgetState } from '../types/widget-state';

@Injectable({
  providedIn: 'root',
})
export class GridPersistenceService {
  private _storage = inject(GridSessionStorageService);

  save(gridId: string, widgets: WidgetState[]): Observable<void> {
    const widgetStates = widgets.map((state) => (state.isVisible ? state : { id: state.id, isVisible: false }));
    const widgetStatesJson = JSON.stringify(widgetStates);
    this._storage.setItem(gridId, widgetStatesJson);
    return timer(100).pipe(map(() => {}));
  }

  load(gridId: string): Observable<WidgetState[]> {
    return timer(250).pipe(
      map(() => gridId),
      map((gridId) => this._storage.getItem(gridId)),
      map((paramsJson) => {
        if (!paramsJson) {
          return [] as WidgetState[];
        }
        return JSON.parse(paramsJson) as WidgetState[];
      }),
      catchError((err) => {
        return of([] as WidgetState[]);
      }),
    );
  }
}
