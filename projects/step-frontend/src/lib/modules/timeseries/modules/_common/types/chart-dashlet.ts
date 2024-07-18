import { Observable } from 'rxjs';
import { DashboardItem } from '@exense/step-core';
import { TimeSeriesContext } from './time-series/time-series-context';
import { FilterBarItem } from './filter/filter-bar-item';
import { TsFilteringMode } from './filter/ts-filtering-mode.enum';
import { FilterUtils } from './filter/filter-utils';
import { OQLBuilder } from './oql-builder';
import { TsFilteringSettings } from './filter/ts-filtering-settings';

export abstract class ChartDashlet {
  /**
   * @param customContext - allows a custom context to be used while preparing the filters. Useful for tables when compare context should be used.
   * @protected
   */
  protected composeRequestFilter(customContext?: TimeSeriesContext): string {
    const item = this.getItem();
    const context = customContext || this.getContext();
    const masterChart = this.getMasterChart();
    const metric = masterChart?.metricKey || item.metricKey;
    const metricOql: string =
      metric === 'threadgroup'
        ? '((attributes.metricType = threadgroup) or (attributes.metricType = sampler and attributes.type = threadgroup))'
        : `attributes.metricType = \"${metric}\"`;

    let filterItemsToInherit: FilterBarItem[] = [];

    const globalFiltering: TsFilteringSettings = context.getFilteringSettings();

    const itemToInheritSettingsFrom = masterChart || item;
    if (itemToInheritSettingsFrom.inheritGlobalFilters) {
      if (globalFiltering.mode === TsFilteringMode.STANDARD) {
        if (itemToInheritSettingsFrom.inheritSpecificFiltersOnly) {
          filterItemsToInherit = globalFiltering.filterItems.filter((i) =>
            itemToInheritSettingsFrom.specificFiltersToInherit.find((attribute) => attribute === i.attributeName),
          );
        } else {
          filterItemsToInherit = globalFiltering.filterItems;
        }
      }
    }

    const localFiltersOql: string = FilterUtils.filtersToOQL(
      itemToInheritSettingsFrom.filters.map(FilterUtils.convertApiFilterItem),
      'attributes',
    );

    if (globalFiltering.mode === TsFilteringMode.STANDARD) {
      return new OQLBuilder()
        .append(metricOql)
        .append(localFiltersOql)
        .append(FilterUtils.filtersToOQL(globalFiltering.hiddenFilters, 'attributes'))
        .append(FilterUtils.filtersToOQL(filterItemsToInherit, 'attributes'))
        .build();
    } else {
      // OQL filtering
      return new OQLBuilder()
        .append(metricOql)
        .append(localFiltersOql)
        .append(FilterUtils.filtersToOQL(globalFiltering.hiddenFilters, 'attributes'))
        .conditionalAppend(itemToInheritSettingsFrom.inheritGlobalFilters, globalFiltering.oql)
        .build();
    }
  }

  abstract getItem(): DashboardItem;
  abstract getContext(): TimeSeriesContext;

  protected getMasterChart(): DashboardItem | undefined {
    let item = this.getItem();
    return item.masterChartId ? this.getContext().getDashlet(item.masterChartId!) : undefined;
  }

  abstract refresh(blur?: boolean): Observable<any>;

  abstract getType(): 'TABLE' | 'CHART';
}
