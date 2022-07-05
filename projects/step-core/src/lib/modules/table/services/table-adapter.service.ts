import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  switchMap,
  of,
  catchError,
  noop,
  shareReplay,
  tap,
  map,
  lastValueFrom,
  Observable,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TableAdapterService {
  public getTableAdapterForApiRequest(apiCallObs: Observable<any>): TableAdapter {
    let result: TableAdapter = {
      inProgress: false,
    };
    result.subject = new BehaviorSubject<any>({});
    result.request = result.subject!.pipe(
      tap((_) => {
        result.inProgress = true;
        console.log('waiting.. ' + result.inProgress);
      }),
      switchMap((_) => apiCallObs),
      tap((_) => {
        result.inProgress = false;
        console.log('finito.. ' + result.inProgress);
      }),
      shareReplay(1)
    );
    return result;
  }
}

export type TableAdapter = {
  inProgress?: boolean;
  subject?: BehaviorSubject<any>;
  request?: Observable<any>;
};
