import { inject, Injectable } from '@angular/core';
import { filter, from, map, Observable, of, switchMap, timer } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class EditorResolverService {
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);

  onCreateNewEntity(parameterName: string = 'createNew'): Observable<void> {
    return this.proceedSearchParameter<void>(parameterName).pipe(filter((value) => value !== undefined));
  }

  onEditEntity(parameterName: string = 'entityId'): Observable<string> {
    return this.proceedSearchParameter<string>(parameterName).pipe(
      filter((value) => value !== undefined),
    ) as Observable<string>;
  }

  private proceedSearchParameter<T>(parameterName: string): Observable<T | undefined> {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };
    const parameterValue = queryParams?.[parameterName];
    if (parameterValue === undefined) {
      return of(undefined);
    }
    delete queryParams[parameterName];
    return from(this._router.navigate([], { relativeTo: this._activatedRoute, queryParams })).pipe(
      switchMap(() => timer(500)),
      map(() => parameterValue),
    );
  }
}
