import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TimeSeriesContext } from '../types/time-series/time-series-context';
import { TimeRangeSelection } from '@exense/step-core';
import { TimeRangeType } from '../types/time-selection/time-range-picker-selection';

const TS_PARAMS_KEY = 'tsParams';

export interface DashboardUrlParams {
  // [key: any]: string | undefined;
  refresh?: string;
  start?: number;
  end?: number;
  timeRange?: TimeRangeSelection;
  grouping?: string;
  relativeRange?: string;
  editMode?: boolean;
}

@Injectable()
export class DashboardUrlParamsService {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);

  collectUrlParams(): DashboardUrlParams {
    const params = this._activatedRoute.snapshot.queryParams;
    const editModeValue = params['edit'];
    console.log(params['grouping'].length);
    return {
      editMode: editModeValue === '1',
      start: params['start'],
      end: params['end'],
      timeRange: this.extractTimeRange(params),
      grouping: params['grouping']?.split(',') || [],
    };
  }

  private extractTimeRange(params: Params): TimeRangeSelection | undefined {
    const rangeType = params['rangeType'] as TimeRangeType;
    switch (rangeType) {
      case TimeRangeType.FULL:
        break;
      case TimeRangeType.ABSOLUTE:
        break;
      case TimeRangeType.RELATIVE:
        break;
      default:
        return undefined;
    }
    return;
  }

  updateUrlParams(context: TimeSeriesContext, timeSelectionType: 'FULL' | 'ABSOLUTE' | 'RELATIVE') {
    const params = this.extractUrlParamsFromContext(context);
    // params.rangeType = timeSelectionType;
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
