import { inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export const TS_PARAMS_KEY = 'tsParams';

export interface ChartUrlParams {
  [key: string]: string | undefined;
  refresh?: string;
  start?: string;
  end?: string;
  relativeRange?: string;
}

@Injectable()
export class ChartUrlParamsService {
  private _activatedRoute = inject(ActivatedRoute);

  getUrlParams(): ChartUrlParams {
    const params = this._activatedRoute.snapshot.queryParams;
    if (!params[TS_PARAMS_KEY]) {
      return {} as ChartUrlParams;
    }
    const tsParams = params[TS_PARAMS_KEY].split(',') as string[];
    return tsParams.reduce((res, key) => {
      if (params[key]) {
        res[key] = params[key];
      }
      return res;
    }, {} as ChartUrlParams);
  }
}
