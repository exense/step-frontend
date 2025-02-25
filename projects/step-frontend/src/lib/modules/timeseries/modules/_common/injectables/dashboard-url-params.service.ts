import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TimeSeriesContext } from '../types/time-series/time-series-context';
import { TimeRange, TimeRangeSelection } from '@exense/step-core';
import { TimeRangePickerSelection, TimeRangeType } from '../types/time-selection/time-range-picker-selection';
import { TsFilteringSettings } from '../types/filter/ts-filtering-settings';
import { TsFilteringMode } from '../types/filter/ts-filtering-mode.enum';
import { FilterBarItemType } from '../types/filter/filter-bar-item';
import { FilterUtils } from '../types/filter/filter-utils';
import { TimeSeriesConfig } from '../types/time-series/time-series.config';
import { DashboardTimeRangeSettings } from '../../../components/dashboard/dashboard-time-range-settings';
import { TimeSeriesUtils } from '../types/time-series/time-series-utils';

const MIN_SUFFIX = '_min';
const MAX_SUFFIX = '_max';

export interface DashboardUrlParams {
  refreshInterval?: number;
  timeRange?: TimeRangeSelection;
  selectedTimeRange?: TimeRange;
  grouping?: string[];
  filters: UrlFilterAttribute[];
  relativeRange?: string;
  editMode?: boolean;
  resolution?: number;
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
    params = Object.keys(params)
      .filter((key) => key.startsWith(TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX))
      .reduce((acc, key) => {
        acc[key.substring(TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX.length)] = params[key];
        return acc;
      }, {} as Params);
    const editModeValue = params['edit'];
    const timeRange = this.extractTimeRange(params);
    return {
      refreshInterval: params['refreshInterval'] ? parseInt(params['refreshInterval']) : undefined,
      editMode: editModeValue === '1',
      timeRange: timeRange,
      selectedTimeRange: this.extractRangeSelection(params),
      grouping: params['grouping']?.split(','),
      filters: this.decodeUrlFilters(params),
      resolution: params['resolution'],
    };
  }

  private extractRangeSelection(params: Params): TimeRange | undefined {
    const from = parseInt(params['select_from']);
    const to = parseInt(params['select_to']);
    if (from && to) {
      return { from, to };
    } else {
      return undefined;
    }
  }

  private extractTimeRange(params: Params): TimeRangeSelection | undefined {
    return TimeSeriesUtils.extractTimeRangeSelectionFromURLParams(params);
  }

  private decodeUrlFilters(params: Params): UrlFilterAttribute[] {
    return Object.entries(params)
      .filter(
        ([key, value]) =>
          key.startsWith(TimeSeriesConfig.DASHBOARD_URL_FILTER_PREFIX) && value !== undefined && value !== '',
      )
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

  updateUrlParams(timeRange: TimeRangePickerSelection, refresh?: number) {
    let params = this.convertTimeRange(timeRange);
    if (refresh !== undefined) {
      params['refreshInterval'] = refresh;
    }
    this.prefixAndPushUrlParams(params);
  }

  updateUrlParamsFromContext(context: TimeSeriesContext) {
    const params = this.convertContextToUrlParams(context, context.getTimeRangeSettings());
    const filterParams = this.encodeContextFilters(context.getFilteringSettings());
    const mergedParams = { ...params, ...filterParams };
    mergedParams['refreshInterval'] = context.getRefreshInterval();
    this.prefixAndPushUrlParams(mergedParams);
  }

  private convertContextToUrlParams(
    context: TimeSeriesContext,
    timeRangeSettings: DashboardTimeRangeSettings,
  ): Record<string, any> {
    const params = this.convertTimeRange(timeRangeSettings.pickerSelection);
    if (context.getGroupDimensions().length > 0) {
      params['grouping'] = context.getGroupDimensions().join(',');
    }
    if (!context.isFullRangeSelected()) {
      const selectedTimeRange = context.getSelectedTimeRange();
      params['select_from'] = selectedTimeRange.from;
      params['select_to'] = selectedTimeRange.to;
    }
    const customResolution = context.getChartsResolution();
    if (customResolution > 0) {
      params['resolution'] = customResolution;
    }
    params['refreshInterval'] = context.getRefreshInterval();

    return params;
  }

  private convertTimeRange(pickerSelection: TimeRangePickerSelection): Record<string, any> {
    const params: Record<string, any> = {
      rangeType: pickerSelection.type,
    };
    if (pickerSelection.type === TimeRangeType.ABSOLUTE) {
      const fullRange = pickerSelection.absoluteSelection!;
      params['from'] = fullRange.from;
      params['to'] = fullRange.to;
    } else if (pickerSelection.type === TimeRangeType.RELATIVE) {
      params['relativeRange'] = pickerSelection.relativeSelection!.timeInMs;
    }
    return params;
  }

  private prefixAndPushUrlParams(params: Record<string, any>): void {
    const prefixedParams = Object.keys(params).reduce((accumulator: any, key: string) => {
      accumulator[TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX + key] = params[key];
      return accumulator;
    }, {});
    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: prefixedParams,
      replaceUrl: true,
    });
  }
}
