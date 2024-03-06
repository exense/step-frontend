import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TimeSeriesContext } from '../types/time-series/time-series-context';
import { TimeRangeSelection, TimeSeriesFilterItem } from '@exense/step-core';
import { TimeRangeType } from '../types/time-selection/time-range-picker-selection';
import { TsFilteringSettings } from '../types/filter/ts-filtering-settings';
import { TsFilteringMode } from '../types/filter/ts-filtering-mode.enum';
import { FilterBarItemType } from '../types/filter/filter-bar-item';
import { FilterUtils } from '../types/filter/filter-utils';
import { min } from 'rxjs';
import { TimeSeriesConfig } from '../types/time-series/time-series.config';

const MIN_SUFFIX = '_min';
const MAX_SUFFIX = '_max';

export interface DashboardUrlParams {
  // [key: any]: string | undefined;
  refresh?: string;
  timeRange?: TimeRangeSelection;
  grouping?: string[];
  filters: UrlFilterAttribute[];
  relativeRange?: string;
  editMode?: boolean;
}

export interface UrlFilterAttribute {
  attribute: string;
  min?: number;
  max?: number;
  values?: string[];
}

@Injectable()
export class DashboardUrlParamsService {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);

  collectUrlParams(): DashboardUrlParams {
    let params = this._activatedRoute.snapshot.queryParams;
    console.log('PARAMS', params);
    params = Object.keys(params)
      .filter((key) => key.startsWith(TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX))
      .reduce((acc, key) => {
        acc[key.substring(TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX.length)] = params[key];
        return acc;
      }, {} as Params);
    const editModeValue = params['edit'];
    return {
      editMode: editModeValue === '1',
      timeRange: this.extractTimeRange(params),
      grouping: params['grouping']?.split(','),
      filters: this.decodeUrlFilters(params),
    };
  }

  private extractTimeRange(params: Params): TimeRangeSelection | undefined {
    const rangeType = params['rangeType'] as TimeRangeType;
    switch (rangeType) {
      case TimeRangeType.ABSOLUTE:
        const from = parseInt(params['from']);
        const to = parseInt(params['to']);
        if (!from || !to) {
          return undefined;
        }
        return { type: rangeType, absoluteSelection: { from: from, to: to } };
      case TimeRangeType.RELATIVE:
        const relativeRange = parseInt(params['relativeRange']);
        return { type: rangeType, relativeSelection: { timeInMs: relativeRange } };
      default:
        return undefined;
    }
  }

  private decodeUrlFilters(params: Params): UrlFilterAttribute[] {
    return Object.entries(params)
      .filter(([key]) => key.startsWith(TimeSeriesConfig.DASHBOARD_URL_FILTER_PREFIX))
      .map(([key, value]) => {
        key = key.substring(TimeSeriesConfig.DASHBOARD_URL_FILTER_PREFIX.length);

        const filterItem: UrlFilterAttribute = { attribute: key };

        if (key.endsWith(MIN_SUFFIX)) {
          filterItem.attribute = key.substring(0, -4);
          filterItem.min = value;
        } else if (key.endsWith(MAX_SUFFIX)) {
          filterItem.attribute = key.substring(0, -4);
          filterItem.max = value;
        } else {
          filterItem.values = value.split(',');
        }
        return filterItem;
      })
      .filter((attr) => attr.values?.length || attr.min != undefined || attr.max != undefined); // not empty filters only
  }

  private encodeContextFilters(filters: TsFilteringSettings): Record<string, any> {
    const encodedParams: Record<string, any> = {};
    if (filters.mode === TsFilteringMode.STANDARD) {
      filters.filterItems.filter(FilterUtils.filterItemIsValid).forEach((item) => {
        const filterKey = TimeSeriesConfig.DASHBOARD_URL_FILTER_PREFIX + item.attributeName;
        switch (item.type) {
          case FilterBarItemType.OPTIONS:
            encodedParams[filterKey] = item.textValues
              ?.filter((t) => t.isSelected)
              .map((t) => t.value)
              .join(',');
            break;
          case FilterBarItemType.FREE_TEXT:
            encodedParams[filterKey] = item.freeTextValues?.join(',');
            break;
          case FilterBarItemType.EXECUTION:
          case FilterBarItemType.TASK:
          case FilterBarItemType.PLAN:
            encodedParams[filterKey] = item.searchEntities?.map((s) => s.searchValue).join(',');
            break;
          case FilterBarItemType.NUMERIC:
          case FilterBarItemType.DATE:
            if (item.min) {
              encodedParams[filterKey + MIN_SUFFIX] = item.min;
            }
            if (item.max) {
              encodedParams[filterKey + MAX_SUFFIX] = item.max;
            }
            break;
        }
      });
    }
    return encodedParams;
  }

  updateUrlParams(context: TimeSeriesContext, timeSelection: TimeRangeSelection) {
    const params = this.convertContextToUrlParams(context, timeSelection);
    const filterParams = this.encodeContextFilters(context.getFilteringSettings());
    const mergedParams = { ...params, ...filterParams };
    const prefixedParams = Object.keys(mergedParams).reduce((accumulator: any, key: string) => {
      accumulator[TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX + key] = mergedParams[key];
      return accumulator;
    }, {});
    // params.rangeType = timeSelectionType;
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: prefixedParams,
    });
  }

  private convertContextToUrlParams(
    context: TimeSeriesContext,
    timeSelection: TimeRangeSelection,
  ): Record<string, any> {
    const params: Record<string, any> = {
      grouping: context.getGroupDimensions().join(','),
      rangeType: timeSelection.type,
    };
    if (timeSelection.type === TimeRangeType.ABSOLUTE) {
      params['from'] = timeSelection.absoluteSelection!.from;
      params['to'] = timeSelection.absoluteSelection!.to;
    } else if (timeSelection.type === TimeRangeType.RELATIVE) {
      params['relativeRange'] = timeSelection.relativeSelection!.timeInMs;
    }

    return params;
  }
}
