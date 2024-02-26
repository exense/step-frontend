import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TimeSeriesContext } from '../types/time-series/time-series-context';

const TS_PARAMS_KEY = 'tsParams';

export interface DashboardUrlParams {
  // [key: any]: string | undefined;
  refresh?: string;
  start?: number;
  end?: number;
  rangeType?: 'FULL' | 'RELATIVE' | 'ABSOLUTE';
  grouping?: string;
  relativeRange?: string;
  editMode?: boolean;
}

@Injectable()
export class DashboardUrlParamsService {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);

  collectUrlParams(): DashboardUrlParams {
    return {
      editMode: this._activatedRoute.snapshot.queryParams['edit'] || false,
    };
  }

  updateUrlParams(context: TimeSeriesContext, timeSelectionType: 'FULL' | 'ABSOLUTE' | 'RELATIVE') {
    const params = this.extractUrlParamsFromContext(context);
    params.rangeType = timeSelectionType;
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: params,
    });
  }

  private extractUrlParamsFromContext(context: TimeSeriesContext): DashboardUrlParams {
    let fullTimeRange = context.getFullTimeRange();
    const params: DashboardUrlParams = {
      grouping: context.getGroupDimensions().join(','),
      start: fullTimeRange.from,
      end: fullTimeRange.to,
    };

    return params;
  }
}
