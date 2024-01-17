import { Component, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Dashlet } from '../model/dashlet';
import {
  BucketAttributes,
  BucketResponse,
  ChartSettings,
  DashboardItem,
  FetchBucketsRequest,
  MetricAttribute,
  TimeRange,
  TimeRangeSelection,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { FilterUtils } from '../../../util/filter-utils';
import { TSChartSeries, TSChartSettings } from '../../../chart/model/ts-chart-settings';
import { TimeSeriesUtils } from '../../../time-series-utils';
import { TimeSeriesConfig } from '../../../time-series.config';
import { UPlotUtils } from '../../../uplot/uPlot.utils';
import { TimeSeriesContext } from '../../../time-series-context';
import { TimeseriesColorsPool } from '../../../util/timeseries-colors-pool';
import { FilterBarItem } from '../../../performance-view/filter-bar/model/filter-bar-item';
import { TimeSeriesChartComponent } from '../../../chart/time-series-chart.component';
import { Observable, of, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChartDashletSettingsComponent } from './settings/chart-dashlet-settings.component';

type AggregationType = 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE';

interface MetricAttributeSelection extends MetricAttribute {
  selected: boolean;
}

@Component({
  selector: 'step-chart-dashlet',
  templateUrl: './chart-dashlet.component.html',
  styleUrls: ['./chart-dashlet.component.scss'],
})
export class ChartDashletComponent implements OnInit, Dashlet {
  readonly AGGREGATES: AggregationType[] = ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT', 'RATE', 'MEDIAN'];

  private _matDialog = inject(MatDialog);

  @ViewChild('chart') chart!: TimeSeriesChartComponent;
  _internalSettings?: TSChartSettings;

  @Input() item!: DashboardItem;
  @Input() context!: TimeSeriesContext;
  @Input() height!: number;
  @Input() editMode = false;

  @Output() remove = new EventEmitter();
  @Output() shiftLeft = new EventEmitter();
  @Output() shiftRight = new EventEmitter();

  readonly PCL_VALUES = [80, 90, 99];
  selectedPclValue: number = this.PCL_VALUES[0];
  groupingSelection: MetricAttributeSelection[] = [];
  selectedAggregate!: AggregationType;

  private _timeSeriesService = inject(TimeSeriesService);

  ngOnInit(): void {
    if (!this.item || !this.context || !this.height) {
      throw new Error('Missing input values');
    }
    this.groupingSelection = this.prepareGroupingAttributes();
    this.selectedAggregate = this.item.chartSettings!.primaryAxes!.aggregation;
    this.fetchDataAndCreateChart().subscribe();
  }

  private prepareGroupingAttributes(): MetricAttributeSelection[] {
    const settings = this.item.chartSettings!;
    const groupingSelection: MetricAttributeSelection[] =
      settings.attributes?.map((a) => ({ ...a, selected: false })) || [];
    settings.grouping?.forEach((a) => {
      const foundAttribute = groupingSelection.find((attr) => attr.name === a);
      if (foundAttribute) {
        foundAttribute.selected = true;
      }
    });
    return groupingSelection;
  }

  refresh(): Observable<any> {
    this.chart?.setBlur(true);
    return this.fetchDataAndCreateChart();
  }

  handleZoomReset() {
    this.context.setChartsLockedState(false);
    this.context.resetZoom();
  }

  switchAggregate(aggregate: AggregationType) {
    this.selectedAggregate = aggregate;
    this.refresh().subscribe();
  }

  toggleGroupingAttribute(attribute: MetricAttributeSelection) {
    attribute.selected = !attribute.selected;
    this.refresh().subscribe();
  }

  private composeRequestFilter(metricKey: string): string {
    let filterItems: FilterBarItem[] = [
      {
        attributeName: 'metricType',
        type: 'FREE_TEXT',
        exactMatch: true,
        freeTextValues: [`"${metricKey}"`],
        searchEntities: [],
      },
    ];

    if (this.item.chartSettings!.inheritGlobalFilters) {
      filterItems = [
        ...filterItems,
        ...FilterUtils.combineGlobalWithChartFilters(
          this.context.getFilteringSettings().filterItems,
          this.item.chartSettings!.filters
        ),
      ];
    }
    return FilterUtils.filtersToOQL(filterItems, 'attributes');
  }

  openChartSettings(): void {
    this._matDialog
      .open(ChartDashletSettingsComponent, { data: { item: this.item } })
      .afterClosed()
      .subscribe((updatedItem) => {
        if (updatedItem) {
          Object.assign(this.item, updatedItem);
          this.refresh().subscribe();
        }
      });
  }

  private createChart(response: TimeSeriesAPIResponse): void {
    const groupDimensions = this.getChartGrouping();
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const primaryAxes = this.item.chartSettings!.primaryAxes!;
    const primaryAggregation = this.selectedAggregate!;
    const series: TSChartSeries[] = response.matrix.map((series, i) => {
      const labelItems = this.getSeriesKeys(response.matrixKeys[i], groupDimensions);
      const seriesKey = labelItems.join(' | ');
      const color =
        primaryAxes.renderingSettings?.seriesColors?.[seriesKey] || this.context.keywordsContext.getColor(seriesKey);

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

    this._internalSettings = {
      title: `${this.item.name} (${primaryAggregation})`,
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
          values: (u, vals) => {
            return vals.map((v: any) => this.getAxesFormatFunction(primaryAggregation, primaryUnit)(v));
          },
        },
      ],
    };
  }

  private fetchDataAndCreateChart(): Observable<TimeSeriesAPIResponse> {
    const settings = this.item.chartSettings!;
    const groupDimensions = this.getChartGrouping();
    const request: FetchBucketsRequest = {
      start: this.context.getSelectedTimeRange().from,
      end: this.context.getSelectedTimeRange().to,
      groupDimensions: groupDimensions,
      oqlFilter: this.composeRequestFilter(settings.metricKey!),
      numberOfBuckets: 100,
      percentiles: this.getChartPclToRequest(settings.primaryAxes!.aggregation!),
    };
    return this._timeSeriesService.getTimeSeries(request).pipe(
      tap((response) => {
        this.createChart(response);
      })
    );
  }

  private getChartGrouping(): string[] {
    if (this.item!.chartSettings!.inheritGlobalGrouping) {
      return this.context.getGroupDimensions();
    } else {
      return this.groupingSelection.filter((s) => s.selected).map((a) => a.name!);
    }
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

  private getUnitLabel(aggregation: AggregationType, unit: string): string {
    if (aggregation === 'RATE') {
      return '/h';
    }
    switch (unit) {
      case '%':
        return '%';
      case 'ms':
        return ' ms';
      default:
        return '';
    }
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
        return b.pclValues?.[this.selectedPclValue];
      default:
        throw new Error('Unhandled aggregation value: ' + aggregation);
    }
  }

  private getSeriesKeys(attributes: BucketAttributes, groupDimensions: string[]): (string | undefined)[] {
    return groupDimensions.map((field) => attributes?.[field]);
  }
}
