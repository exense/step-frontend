import { Component, inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {
  BucketAttributes,
  BucketResponse,
  Execution,
  ExecutiontTaskParameters,
  FetchBucketsRequest,
  MetricAttribute,
  MetricType,
  Plan,
  TimeRange,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';

//@ts-ignore
import uPlot = require('uplot');
import { ChartSkeletonComponent, TimeSeriesChartComponent, TSChartSeries, TSChartSettings } from '../../../chart';
import { Observable } from 'rxjs';
import {
  TimeSeriesUtils,
  TimeSeriesUtilityService,
  TimeSeriesConfig,
  UPlotUtilsService,
  TimeseriesColorsPool,
  FilterUtils,
  COMMON_IMPORTS,
} from '../../../_common';

type AggregationType = 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'RATE' | 'MEDIAN' | 'PERCENTILE';

interface MetricAttributeSelection extends MetricAttribute {
  selected: boolean;
}

@Component({
  selector: 'step-metric-chart',
  templateUrl: './metric-chart.component.html',
  styleUrls: ['./metric-chart.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS, ChartSkeletonComponent, TimeSeriesChartComponent],
})
export class MetricChartComponent implements OnInit, OnChanges {
  private _uPlotUtils = inject(UPlotUtilsService);

  chartSettings?: TSChartSettings;
  @ViewChild(TimeSeriesChartComponent) chart!: TimeSeriesChartComponent;

  @Input() filters: Record<string, any> = {};
  @Input() settings!: MetricType;
  @Input() range!: TimeRange;
  @Input() allowGroupingChange = true;
  @Input() allowMetricChange = true;
  @Input() colorsPool: TimeseriesColorsPool = new TimeseriesColorsPool();

  readonly AGGREGATES: AggregationType[] = ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT', 'RATE', 'MEDIAN'];
  readonly PCL_VALUES = [80, 90, 99];
  selectedPclValue: number = this.PCL_VALUES[0];
  selectedAggregate!: AggregationType;
  groupingAttributes: MetricAttributeSelection[] = [];
  selectedRange = this.range;

  isLoading = false;

  private _timeSeriesService = inject(TimeSeriesService);
  private _timeSeriesUtilityService = inject(TimeSeriesUtilityService);

  ngOnInit(): void {
    this.selectedRange = this.range;
    this.groupingAttributes = this.settings.attributes?.map((a) => ({ ...a, selected: false })) || [];
    this.settings.defaultGroupingAttributes?.forEach((a) => {
      const foundAttribute = this.groupingAttributes.find((attr) => attr.name === a);
      if (foundAttribute) {
        foundAttribute.selected = true;
      }
    });
    this.selectedAggregate = this.settings.defaultAggregation || 'SUM';
    this.fetchDataAndCreateChart(this.settings);
  }

  private fetchDataAndCreateChart(settings: MetricType): void {
    this.chart?.setBlur(true);
    const groupDimensions: string[] = this.groupingAttributes.filter((a) => a.selected).map((a) => a.name!);
    let pclValues: number[] | undefined;
    if (this.selectedAggregate === 'MEDIAN') {
      pclValues = [50];
    } else if (this.selectedAggregate === 'PERCENTILE') {
      pclValues = [this.selectedPclValue];
    }
    const request: FetchBucketsRequest = {
      start: this.selectedRange.from,
      end: this.selectedRange.to,
      groupDimensions: groupDimensions,
      oqlFilter: FilterUtils.objectToOQL({ ...this.filters, 'attributes.metricType': `"${settings.name!}"` }),
      numberOfBuckets: 100,
      percentiles: pclValues,
    };
    this._timeSeriesService.getTimeSeries(request).subscribe((response) => {
      this.isLoading = false;
      this.chartSettings = this.createChartSettings(response, groupDimensions);
    });
  }

  changeSelection(range: TimeRange) {
    range.from = Math.floor(range.from!);
    range.to = Math.floor(range.to!);
    if (this.selectedRange.from !== range.from || this.selectedRange.to !== range.to) {
      this.selectedRange = range;
      this.fetchDataAndCreateChart(this.settings);
    }
  }

  resetSelection() {
    this.selectedRange = this.range;
    this.fetchDataAndCreateChart(this.settings);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cSettings = changes['settings'];
    const cRange = changes['range'];

    if (cSettings && cSettings.currentValue == undefined) {
      throw new Error('Metric settings input is mandatory');
    }
    if (cRange && cRange.currentValue == undefined) {
      throw new Error('Range input is mandatory');
    }
    if (cRange) {
      this.selectedRange = this.range;
    }
    if (cSettings?.previousValue || cRange?.previousValue) {
      this.fetchDataAndCreateChart(this.settings);
    }
  }

  toggleGroupingAttribute(attribute: MetricAttributeSelection) {
    this.isLoading = true;
    attribute.selected = !attribute.selected;
    this.fetchDataAndCreateChart(this.settings);
  }

  switchAggregate(aggregate: AggregationType) {
    this.isLoading = true;
    this.selectedAggregate = aggregate;
    this.fetchDataAndCreateChart(this.settings);
  }

  private createChartSettings(response: TimeSeriesAPIResponse, groupDimensions: string[]): TSChartSettings {
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const series: TSChartSeries[] = response.matrix.map((series, i) => {
      const labelItems = this.getSeriesKeys(response.matrixKeys[i], groupDimensions);
      const seriesKey = labelItems.join(' | ');
      const color = this.settings.renderingSettings?.seriesColors?.[seriesKey] || this.colorsPool.getColor(seriesKey);
      return {
        id: seriesKey,
        label: seriesKey,
        labelItems: labelItems,
        legendName: seriesKey,
        data: series.map((b) => this.getBucketValue(b, this.selectedAggregate!)),
        value: (self: uPlot, x: number) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(x),
        stroke: color,
        fill: (self: uPlot, seriesIdx: number) => this._uPlotUtils.gradientFill(self, color),
        points: { show: false },
        show: true,
      };
    });
    let yAxesUnit = this.getUnitLabel(this.settings);

    groupDimensions.forEach((dimension, i) => {
      switch (dimension) {
        case TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE:
          this.fetchAndSetLabels(
            series,
            i,
            (entitiesIds) => this._timeSeriesUtilityService.getExecutionByIds(entitiesIds),
            (e: Execution) => e.description!,
          );
          break;
        case TimeSeriesConfig.TASK_ID_ATTRIBUTE:
          this.fetchAndSetLabels(
            series,
            i,
            (entitiesIds) => this._timeSeriesUtilityService.getTasksByIds(entitiesIds),
            (task: ExecutiontTaskParameters) => task.attributes?.['name'],
          );
          break;
        case TimeSeriesConfig.PLAN_ID_ATTRIBUTE:
          this.fetchAndSetLabels(
            series,
            i,
            (entitiesIds) => this._timeSeriesUtilityService.getPlansByIds(entitiesIds),
            (plan: Plan) => plan.attributes?.['name'],
          );
          break;
        default:
          break;
      }
    });

    return {
      title: `${this.settings.displayName!} (${this.selectedAggregate}${
        this.selectedAggregate === 'PERCENTILE' ? ` ${this.selectedPclValue}th` : ''
      })`,
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
          values: (u: uPlot, vals: number[]) => {
            return vals.map((v) => this.getAxesFormatFunction(this.settings.unit!)(v));
          },
        },
      ],
    };
  }

  /**
   * This function will fetch the entities found in the labels, and replace their ids with the appropriate name.
   * @param series
   * @param groupDimensionIndex
   * @param fetchByIds
   * @param mapEntityToLabel
   * @private
   */
  private fetchAndSetLabels<T>(
    series: TSChartSeries[],
    groupDimensionIndex: number,
    fetchByIds: (ids: string[]) => Observable<T[]>,
    mapEntityToLabel: (entity: T) => string | undefined,
  ) {
    const ids: string[] = series.map((s) => s.labelItems[groupDimensionIndex] as string).filter((id) => !!id);
    if (!ids.length) {
      return;
    }
    fetchByIds(ids).subscribe(
      (entities) => {
        const entitiesByIds = new Map<string, T>();
        entities.forEach((entity) => {
          // Assuming each entity has an 'id' property
          const entityId = (entity as any).id as string; // Cast to any to access 'id' property
          if (entityId) {
            entitiesByIds.set(entityId, entity);
          }
        });
        series.forEach((s) => {
          const entityId = s.labelItems[groupDimensionIndex];
          if (entityId) {
            const entity = entitiesByIds.get(entityId);
            if (entity) {
              this.chart.setLabelItem(s.id, groupDimensionIndex, mapEntityToLabel(entity));
            } else {
              // entity was not fetched
              this.chart.setLabelItem(s.id, groupDimensionIndex, this.updateFailedToLoadLabel(entityId));
            }
          }
        });
      },
      (error) => {
        this.handleEntityLoadingFailed(series, groupDimensionIndex);
      },
    );
  }

  private handleEntityLoadingFailed(series: TSChartSeries[], groupDimensionIndex: number) {
    series.forEach((s) => {
      const entityId = s.labelItems[groupDimensionIndex];
      if (entityId) {
        this.chart.setLabelItem(s.id, groupDimensionIndex, this.updateFailedToLoadLabel(entityId));
      }
    });
  }

  private updateFailedToLoadLabel(label: string): string {
    return label + ' (unresolved)';
  }

  private getAxesFormatFunction(unit: string): (v: number) => string {
    if (!unit) {
      return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber;
    }
    if (this.selectedAggregate === 'RATE') {
      return (v) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(v) + '/h';
    }
    switch (unit) {
      case '1':
        return (v) => v.toString() + this.getUnitLabel(this.settings);
      case 'ms':
        return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.time;
      case '%':
        return (v) => v.toString() + this.getUnitLabel(this.settings);
      default:
        throw new Error('Unit not handled: ' + unit);
    }
  }

  private getUnitLabel(metric: MetricType): string {
    if (this.selectedAggregate === 'RATE') {
      return '/h';
    }
    if (metric.unit === '%') {
      return '%';
    } else if (metric.unit === 'ms') {
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
        return b.pclValues?.[this.selectedPclValue];
      default:
        throw new Error('Unhandled aggregation value: ' + aggregation);
    }
  }

  private getSeriesKeys(attributes: BucketAttributes, groupDimensions: string[]): (string | undefined)[] {
    if (Object.keys(attributes).length === 0) {
      return [undefined];
    }
    return groupDimensions.map((field) => attributes[field]);
  }
}
