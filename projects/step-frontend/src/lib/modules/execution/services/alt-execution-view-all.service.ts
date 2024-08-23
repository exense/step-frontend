import { inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';

@Injectable()
export class AltExecutionViewAllService {
  private _activatedRoute = inject(ActivatedRoute);

  get isViewAll(): boolean {
    return this._activatedRoute.snapshot.queryParamMap.has('viewAll');
  }

  readonly isViewAll$ = this._activatedRoute.queryParamMap.pipe(
    map((queryParamMap) => queryParamMap.has('viewAll')),
    distinctUntilChanged(),
  );
}
