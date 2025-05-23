import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { TimeSeriesContext } from '../types/time-series/time-series-context';
import { TimeRange, TimeRangeSelection } from '@exense/step-core';
import { TimeRangePickerSelection, TimeRangeType } from '../types/time-selection/time-range-picker-selection';
import { TsFilteringSettings } from '../types/filter/ts-filtering-settings';
import { TsFilteringMode } from '../types/filter/ts-filtering-mode.enum';
import { FilterBarItemType } from '../types/filter/filter-bar-item';
import { FilterUtils } from '../types/filter/filter-utils';
import { TimeSeriesConfig } from '../types/time-series/time-series.config';
import { DashboardTimeRangeSettings } from '../../../components/dashboard/dashboard-time-range-settings';
import { filter, first, map, of } from 'rxjs';
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

  patchUrlParams(timeRange: TimeRangePickerSelection, refresh?: number, replaceUrl = false) {
    let params = this.convertTimeRange(timeRange);
    if (refresh !== undefined) {
      params['refreshInterval'] = refresh;
    }
    this.prefixAndPushUrlParams(params, replaceUrl, true);
  }

  updateRefreshInterval(rate: number, replaceUrl: boolean) {
    const newParams = this.prefixParams({ refreshInterval: rate });

    const mergedParams = { ...this._activatedRoute.snapshot.queryParams, ...newParams };

    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      replaceUrl: replaceUrl,
      queryParams: mergedParams,
    });
  }

  updateUrlParamsFromContext(
    context: TimeSeriesContext,
    timeRange: TimeRangePickerSelection,
    refreshInterval: number | undefined,
    replaceUrl = false,
  ) {
    let params = { ...this.convertTimeRange(timeRange), ...this.convertContextToUrlParams(context) };
    const filterParams = this.encodeContextFilters(context.getFilteringSettings());
    const mergedParams = { ...params, ...filterParams };
    if (refreshInterval !== undefined) {
      mergedParams['refreshInterval'] = refreshInterval;
    }
    this.prefixAndPushUrlParams(mergedParams, replaceUrl);
  }

  private convertContextToUrlParams(context: TimeSeriesContext): Record<string, any> {
    const params: Record<string, any> = {};
    params['grouping'] = context.getGroupDimensions()?.join(',') || '';
    if (!context.isFullRangeSelected()) {
      const selectedTimeRange = context.getSelectedTimeRange();
      params['select_from'] = selectedTimeRange.from;
      params['select_to'] = selectedTimeRange.to;
    } else {
      params['select_from'] = null; // force cleaning
      params['select_to'] = null; // force cleaning
    }
    const customResolution = context.getChartsResolution();
    params['resolution'] = customResolution || null;

    return params;
  }

  private convertTimeRange(pickerSelection: TimeRangePickerSelection): Record<string, any> {
    let params: Record<string, any> = {
      rangeType: pickerSelection?.type || null,
      from: null,
      to: null,
      relativeRange: null,
    };
    if (!pickerSelection) {
      return params;
    }
    if (pickerSelection.type === TimeRangeType.ABSOLUTE) {
      const fullRange = pickerSelection.absoluteSelection!;
      params['from'] = fullRange.from;
      params['to'] = fullRange.to;
    } else if (pickerSelection.type === TimeRangeType.RELATIVE) {
      params['relativeRange'] = pickerSelection.relativeSelection!.timeInMs;
    }
    return params;
  }

  private prefixParams(params: Record<string, any>) {
    const updatedParams: Record<string, any> = {};
    Object.keys(params).forEach((key) => {
      const prefixedParam = TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX + key;
      updatedParams[prefixedParam] = params[key];
    });
    return updatedParams;
  }

  private prefixAndPushUrlParams(params: Record<string, any>, replaceUrl: boolean, patch?: boolean): void {
    const updatedParams = { ...this._activatedRoute.snapshot.queryParams };
    Object.keys(updatedParams).forEach((key) => {
      if (key.startsWith(TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX + TimeSeriesConfig.DASHBOARD_URL_FILTER_PREFIX)) {
        // cleanup the filters that are not present
        updatedParams[key] = null; // Set to null so we force the cleaning of the param
      }
    });
    Object.keys(params).forEach((key) => {
      const prefixedParam = TimeSeriesConfig.DASHBOARD_URL_PARAMS_PREFIX + key;
      updatedParams[prefixedParam] = params[key];
    });

    // If current navigation is performing, update url parameters after the navigation is completed
    // Otherwise running navigation might be prevented.
    const previousNavigation$ = !this._router.getCurrentNavigation()
      ? of(true)
      : this._router.events.pipe(
          first((event) => event instanceof NavigationEnd),
          map(() => true),
        );

    previousNavigation$.subscribe(() => {
      this._router.navigate([], {
        replaceUrl: replaceUrl,
        relativeTo: this._activatedRoute,
        queryParams: updatedParams,
        queryParamsHandling: 'merge',
      });
    });
  }
}
