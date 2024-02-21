import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeSeriesContext } from '../types/time-series/time-series-context';

const TS_PARAMS_KEY = 'tsParams';

export interface DashboardUrlParams {
  [key: string]: string | undefined;
  refresh?: string;
  start?: string;
  end?: string;
  relativeRange?: string;
}

@Injectable()
export class DashboardUrlParamsService {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);

  constructor() {}

  updateUrlParams(context: TimeSeriesContext) {
    const params = this.extractUrlParamsFromContext(context);
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: params,
    });
  }

  private extractUrlParamsFromContext(context: TimeSeriesContext): DashboardUrlParams {
    const params: DashboardUrlParams = {
      grouping: context.getGroupDimensions().join(','),
    };

    return params;
  }

  getUrlParams(): DashboardUrlParams {
    return {};
  }
}
