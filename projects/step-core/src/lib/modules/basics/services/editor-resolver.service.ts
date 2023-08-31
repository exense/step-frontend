import { inject, Injectable } from '@angular/core';
import { AJS_LOCATION } from '../../../shared';
import { filter, map, Observable, of, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EditorResolverService {
  private _$location = inject(AJS_LOCATION);

  onCreateNewEntity(parameterName: string = 'createNew'): Observable<void> {
    return this.proceedSearchParameter<void>(parameterName).pipe(filter((value) => value !== undefined));
  }

  onEditEntity(parameterName: string = 'entityId'): Observable<string> {
    return this.proceedSearchParameter<string>(parameterName).pipe(
      filter((value) => value !== undefined)
    ) as Observable<string>;
  }

  private proceedSearchParameter<T>(parameterName: string): Observable<T | undefined> {
    const parameterValue = this._$location.search()[parameterName] as T;
    if (parameterValue !== undefined) {
      this._$location.search(parameterName, null);
      return timer(500).pipe(map(() => parameterValue));
    }
    return of(undefined);
  }
}
