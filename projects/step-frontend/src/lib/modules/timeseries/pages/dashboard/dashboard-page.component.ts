import { Component, inject, OnInit, ViewChildren } from '@angular/core';
import {
  BucketAttributes,
  BucketResponse,
  ChartSettings,
  DashboardItem,
  DashboardsService,
  DashboardView,
  DashletComponent,
  FetchBucketsRequest,
  MetricAttribute,
  TimeRange,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { TSChartSeries, TSChartSettings } from '../../chart/model/ts-chart-settings';
import { FilterUtils } from '../../util/filter-utils';
import { TimeSeriesUtils } from '../../time-series-utils';
import { TimeSeriesConfig } from '../../time-series.config';
import { UPlotUtils } from '../../uplot/uPlot.utils';
import { TimeseriesColorsPool } from '../../util/timeseries-colors-pool';
import { TimeSeriesContext } from '../../time-series-context';
import { TimeSeriesContextsFactory } from '../../time-series-contexts-factory.service';
import { TimeRangePickerSelection } from '../../time-selection/time-range-picker-selection';

//@ts-ignore
import uPlot = require('uplot');
import { TsFilterItem } from '../../performance-view/filter-bar/model/ts-filter-item';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { ChartDashletComponent } from './chart-dashlet/chart-dashlet.component';
import { Dashlet } from './model/dashlet';

type AggregationType = 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE';

interface ChartConfig {
  state: DashboardItem; // input
  finalSettings?: TSChartSettings; // output

  groupingAttributes: MetricAttributeSelection[];
}

interface MetricAttributeSelection extends MetricAttribute {
  selected: boolean;
}

@Component({
  selector: 'step-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit {
  readonly AGGREGATES: AggregationType[] = ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT', 'RATE', 'MEDIAN'];

  @ViewChildren(ChartDashletComponent) dashlets: Dashlet[] = [];

  private _timeSeriesService = inject(TimeSeriesService);
  private _timeSeriesContextFactory = inject(TimeSeriesContextsFactory);
  private _dashboardService = inject(DashboardsService);
  colorsPool: TimeseriesColorsPool = new TimeseriesColorsPool();

  dashboard!: DashboardView;
  chartSettings: TSChartSettings[] = [];

  chartConfigs: ChartConfig[] = [];

  context!: TimeSeriesContext;

  compareModeEnabled = false;
  timeRangeOptions: TimeRangePickerSelection[] = TimeSeriesConfig.ANALYTICS_TIME_SELECTION_OPTIONS;
  timeRangeSelection: TimeRangePickerSelection = this.timeRangeOptions[0];

  terminator$ = new Subject<void>();

  initContext(dashboard: DashboardView) {
    const dashboardTimeRange = dashboard.timeRange!;
    const timeRange: TimeRange = {
      from: dashboardTimeRange.absoluteSelection!.from!,
      to: dashboardTimeRange.absoluteSelection!.to!,
    };
    if (dashboard.timeRange && dashboard.timeRange.type === 'RELATIVE') {
      const timeInMs = dashboardTimeRange.relativeRangeMs!;
      const foundRelativeOption = this.timeRangeOptions.find((o) => {
        return o.type === 'RELATIVE' && timeInMs === timeInMs;
      });
      this.timeRangeSelection = foundRelativeOption || {
        type: 'RELATIVE',
        relativeSelection: { label: `Last ${timeInMs / 60000} minutes`, timeInMs: timeInMs },
      };
    } else {
      this.timeRangeSelection = { ...dashboardTimeRange, type: dashboardTimeRange.type! };
    }
    this.context = this._timeSeriesContextFactory.createContext({
      id: dashboard.id!,
      timeRange: timeRange,
      grouping: dashboard.grouping || [],
      filters: this.prepareFilterItems(),
    });
  }

  ngOnInit(): void {
    this._dashboardService.getAll1().subscribe((dashboards) => {
      this.dashboard = dashboards[0];
      this.initContext(this.dashboard);
      this.chartSettings = new Array(this.dashboard!.dashlets!.length);
      this.dashboard.dashlets!.forEach((dashlet, i) => {
        const settings = dashlet.chartSettings!;
        const primarySettings = settings.primaryAxes!;
        const grouping = settings.grouping || [];
        const request: FetchBucketsRequest = {
          start: this.dashboard.timeRange!.absoluteSelection!.from!,
          end: this.dashboard.timeRange!.absoluteSelection!.to!,
          groupDimensions: grouping,
          oqlFilter: FilterUtils.objectToOQL({ 'attributes.metricType': `"${settings.metricKey!}"` }),
          numberOfBuckets: 100,
          percentiles: this.getChartPclToRequest(primarySettings.aggregation!),
        };

        const groupingSelection: MetricAttributeSelection[] =
          settings.attributes?.map((a) => ({ ...a, selected: false })) || [];
        settings.grouping?.forEach((a) => {
          const foundAttribute = groupingSelection.find((attr) => attr.name === a);
          if (foundAttribute) {
            foundAttribute.selected = true;
          }
        });

        const chartConfig: ChartConfig = {
          state: dashlet,
          groupingAttributes: groupingSelection,
        };
        this.chartConfigs.push(chartConfig);

        this._timeSeriesService.getTimeSeries(request).subscribe((response) => {
          chartConfig.finalSettings = this.createChartSettings(dashlet!.name!, settings, response, grouping);
        });
        this.subscribeForTimeRangeChange();
      });
    });
  }

  private getContext(compare: boolean): TimeSeriesContext {
    return this.context;
  }

  private subscribeForTimeRangeChange(compareCharts = false) {
    const context = this.getContext(compareCharts);
    context
      .onTimeSelectionChange()
      .pipe(
        switchMap((newRange) =>
          compareCharts ? this.handleSelectionChange(newRange) : this.handleSelectionChange(newRange)
        ),
        takeUntil(compareCharts ? this.terminator$ : this.terminator$)
      )
      .subscribe();
  }

  handleSelectionChange(selection: TimeRange): Observable<any> {
    // if (TimeSeriesUtils.intervalsEqual(this.findRequestBuilder.getRange(), selection)) {
    //   // nothing happened
    //   return of(undefined);
    // }
    return this.refreshAllCharts();
  }

  private refreshAllCharts(): Observable<void> {
    console.log('REFRESHING ALL');
    this.dashlets?.forEach((dashlet) => {
      console.log('WE HAVE ONE', dashlet);
    });
    return of();
  }

  toggleGroupingAttribute(chartConfig: ChartConfig, attribute: MetricAttributeSelection) {
    attribute.selected = !attribute.selected;
  }

  private getChartPclToRequest(aggregation: AggregationType): number[] {
    switch (aggregation) {
      case 'MEDIAN':
        return [50];
      case 'PERCENTILE':
        return [90, 98, 99];
      default:
        return [];
    }
  }

  private createChartSettings(
    name: string,
    settings: ChartSettings,
    response: TimeSeriesAPIResponse,
    groupDimensions: string[]
  ): TSChartSettings {
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const primaryAxes = settings.primaryAxes!;
    const primaryAggregation = primaryAxes.aggregation!;
    const series: TSChartSeries[] = response.matrix.map((series, i) => {
      const labelItems = this.getSeriesKeys(response.matrixKeys[i], groupDimensions);
      const seriesKey = labelItems.join(' | ');
      const color = primaryAxes.renderingSettings?.seriesColors?.[seriesKey] || this.colorsPool.getColor(seriesKey);

      return {
        id: seriesKey,
        label: seriesKey,
        labelItems: labelItems,
        legendName: seriesKey,
        data: series.map((b) => this.getBucketValue(b, primaryAggregation!)),
        value: (self, x) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(x),
        stroke: color,
        fill: (self: uPlot, seriesIdx: number) => UPlotUtils.gradientFill(self, color),
        points: { show: false },
        show: true,
      };
    });
    const primaryUnit = primaryAxes.unit!;
    const yAxesUnit = this.getUnitLabel(primaryAggregation, primaryUnit);

    return {
      title: `${name} (${primaryAggregation})`,
      xValues: xLabels,
      series: series,
      tooltipOptions: {
        enabled: true,
        yAxisUnit: yAxesUnit,
      },
      showLegend: groupDimensions.length > 0, // in case it has grouping, display the legend
      axes: [
        {
          size: TimeSeriesConfig.CHART_LEGEND_SIZE,
          scale: 'y',
          values: (u, vals, space) => {
            return vals.map((v) => this.getAxesFormatFunction(primaryAggregation, primaryUnit)(v));
          },
        },
      ],
    };
  }

  private getAxesFormatFunction(aggregation: AggregationType, unit: string): (v: number) => string {
    if (!unit) {
      return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber;
    }
    if (aggregation === 'RATE') {
      return (v) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(v) + '/h';
    }
    switch (unit) {
      case '1':
        return (v) => v.toString() + this.getUnitLabel(aggregation, unit);
      case 'ms':
        return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.time;
      case '%':
        return (v) => v.toString() + this.getUnitLabel(aggregation, unit);
      default:
        throw new Error('Unit not handled: ' + unit);
    }
  }

  handleTimeRangeChange(params: { selection: TimeRangePickerSelection; triggerRefresh: boolean }) {
    // this.timeRangeSelection = params.selection;
    // let newTimeRange: TSTimeRange = this.calculateTimeRange(params.selection);
    // this.updateFullRange(newTimeRange, params.triggerRefresh);
  }

  private getUnitLabel(aggregation: AggregationType, unit: string): string {
    if (aggregation === 'RATE') {
      return '/h';
    }
    if (unit === '%') {
      return '%';
    } else if (unit === 'ms') {
      return ' ms';
    } else {
      return '';
    }
  }

  private getBucketValue(b: BucketResponse, aggregation: AggregationType): number | undefined {
    if (!b) {
      return 0;
    }
    switch (aggregation) {
      case 'SUM':
        return b.sum;
      case 'AVG':
        return b.sum / b.count;
      case 'MAX':
        return b.max;
      case 'MIN':
        return b.min;
      case 'COUNT':
        return b.count;
      case 'RATE':
        return b.throughputPerHour;
      case 'MEDIAN':
        return b.pclValues?.[50];
      case 'PERCENTILE':
      // return b.pclValues?.[this.selectedPclValue];
      default:
        throw new Error('Unhandled aggregation value: ' + aggregation);
    }
  }

  private prepareFilterItems(): TsFilterItem[] {
    return (
      this.dashboard.filters?.map((item) => {
        const textValues: { value: string; isSelected?: boolean }[] =
          item.textOptions?.map((option) => ({
            value: option,
            isSelected: false,
          })) || [];
        item!.textValues?.forEach((value) => {
          textValues.filter((t) => t.value === value).forEach((item) => (item.isSelected = true));
        });
        return {
          type: item.type!,
          label: item.label || '',
          attributeName: item.attribute!,
          exactMatch: item.exactMatch!,
          textValues: textValues,
          searchEntities: [],
          min: item.min,
          max: item.max,
          isLocked: !!item.label,
          removable: false,
        };
      }) || []
    );
  }

  private getSeriesKeys(attributes: BucketAttributes, groupDimensions: string[]): (string | undefined)[] {
    if (Object.keys(attributes).length === 0) {
      return [undefined];
    }
    return groupDimensions.map((field) => attributes[field]);
  }
}
