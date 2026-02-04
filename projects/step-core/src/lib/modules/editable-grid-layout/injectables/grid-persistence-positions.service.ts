import { inject, Injectable } from '@angular/core';
import { WidgetPosition, WidgetPositionParams } from '../types/widget-position';
import { catchError, map, Observable, of, timer } from 'rxjs';
import { GridSessionStorageService } from './grid-session-storage.service';

@Injectable({
  providedIn: 'root',
})
export class GridPersistencePositionsService {
  private _storage = inject(GridSessionStorageService);

  savePositions(gridId: string, position: Record<string, WidgetPosition>): Observable<void> {
    const positionParams = Object.entries(position).reduce(
      (res, [key, position]) => {
        res[key] = {
          row: position.row,
          column: position.column,
          widthInCells: position.widthInCells,
          heightInCells: position.heightInCells,
        };
        return res;
      },
      {} as Record<string, WidgetPositionParams>,
    );
    const paramsJson = JSON.stringify(positionParams);
    this._storage.setItem(gridId, paramsJson);
    return timer(100).pipe(map(() => {}));
  }

  loadPositions(gridId: string): Observable<Record<string, WidgetPosition>> {
    return timer(250).pipe(
      map(() => gridId),
      map((gridId) => this._storage.getItem(gridId)),
      map((paramsJson) => {
        if (!paramsJson) {
          return {} as Record<string, WidgetPositionParams>;
        }
        return JSON.parse(paramsJson) as Record<string, WidgetPositionParams>;
      }),
      catchError((err) => {
        return of({} as Record<string, WidgetPositionParams>);
      }),
      map((params) =>
        Object.entries(params).reduce(
          (res, [key, positionParam]) => {
            res[key] = new WidgetPosition(key, positionParam);
            return res;
          },
          {} as Record<string, WidgetPosition>,
        ),
      ),
    );
  }
}
