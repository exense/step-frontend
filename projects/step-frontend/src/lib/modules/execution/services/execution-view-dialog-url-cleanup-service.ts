import { inject, Injectable } from '@angular/core';
import { DialogParentService, DialogRouteResult } from '@exense/step-core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class ExecutionViewDialogUrlCleanupService implements DialogParentService {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);

  private readonly PRESERVE_PARAMS_PREFIX = 'dc_';

  navigateBack(result?: DialogRouteResult, relativeTo?: ActivatedRoute) {
    const filteredParams = Object.keys(this._activatedRoute.snapshot.queryParams)
      .filter((key) => key.startsWith(this.PRESERVE_PARAMS_PREFIX))
      .reduce(
        (obj, key) => {
          obj[key] = this._activatedRoute.snapshot.queryParams[key];
          return obj;
        },
        {} as { [key: string]: any },
      );

    this._router.navigate(['..'], { relativeTo: relativeTo!, queryParams: filteredParams });
  }
}
