import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  BucketAttributes,
  BucketResponse,
  DashboardItem,
  Execution,
  ExecutiontTaskParameters,
  FetchBucketsRequest,
  MetricAttribute,
  Plan,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  TimeSeriesConfig,
  TimeSeriesContext,
  TimeSeriesUtilityService,
  TimeSeriesUtils,
  UPlotUtilsService,
} from '../../modules/_common';
import { ChartSkeletonComponent, TimeSeriesChartComponent, TSChartSeries, TSChartSettings } from '../../modules/chart';
import { Observable, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChartDashletSettingsComponent } from '../chart-dashlet-settings/chart-dashlet-settings.component';
import { Axis } from 'uplot';
import { ChartGenerators } from '../../modules/legacy/injectables/chart-generators';
import { ChartAggregation } from '../../modules/_common/types/chart-aggregation';

declare const uPlot: any;

interface MetricAttributeSelection extends MetricAttribute {
  selected: boolean;
}

@Component({
  selector: 'step-chart-dashlet',
  templateUrl: './chart-dashlet.component.html',
  styleUrls: ['./chart-dashlet.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS, ChartSkeletonComponent, TimeSeriesChartComponent],
})
export class ChartDashletComponent implements OnInit, OnChanges {
  readonly AGGREGATES: ChartAggregation[] = [
    ChartAggregation.SUM,
    ChartAggregation.AVG,
    ChartAggregation.MAX,
    ChartAggregation.MIN,
    ChartAggregation.COUNT,
    ChartAggregation.RATE,
    ChartAggregation.MEDIAN,
  ];

  private _matDialog = inject(MatDialog);
  private _uPlotUtils = inject(UPlotUtilsService);

  @ViewChild('chart') chart!: TimeSeriesChartComponent;
  _internalSettings?: TSChartSettings;
  _attributesByIds: Record<string, MetricAttribute> = {};

  @Input() item!: DashboardItem;
  @Input() context!: TimeSeriesContext;
  @Input() height!: number;
  @Input() editMode = false;

  @Output() remove = new EventEmitter();
  @Output() shiftLeft = new EventEmitter();
  @Output() shiftRight = new EventEmitter();

  readonly ChartAggregation = ChartAggregation;
  readonly PCL_VALUES = [80, 90, 99];
  selectedPclValue?: number;
  groupingSelection: MetricAttributeSelection[] = [];
  selectedAggregate!: ChartAggregation;

  private _timeSeriesService = inject(TimeSeriesService);
  private _timeSeriesUtilityService = inject(TimeSeriesUtilityService);

  ngOnInit(): void {
    if (!this.item || !this.context || !this.height) {
      throw new Error('Missing input values');
    }
    this.prepareState(this.item);
    this.fetchDataAndCreateChart().subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cItem = changes['item'];
    if (cItem?.previousValue !== cItem?.currentValue || cItem.firstChange) {
      this.prepareState(cItem.currentValue);
      this.refresh(true).subscribe();
    }
  }

  private prepareState(item: DashboardItem) {
    item.chartSettings!.attributes?.forEach((attr) => (this._attributesByIds[attr.name] = attr));
    this.groupingSelection = this.prepareGroupingAttributes(item);
    this.selectedAggregate = item.chartSettings!.primaryAxes!.aggregation as ChartAggregation;
    this.selectedPclValue = item.chartSettings!.primaryAxes!.pclValue;
    if (this.selectedAggregate === ChartAggregation.PERCENTILE && !this.selectedPclValue) {
      this.selectedPclValue = this.PCL_VALUES[0];
    }
  }

  private prepareGroupingAttributes(item: DashboardItem): MetricAttributeSelection[] {
    const settings = item.chartSettings!;
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

  refresh(blur?: boolean): Observable<any> {
    if (blur) {
      this.chart?.setBlur(true);
    }
    return this.fetchDataAndCreateChart();
  }

  handleZoomReset() {
    this.context.setChartsLockedState(false);
    this.context.resetZoom();
  }

  switchAggregate(aggregate: ChartAggregation, pclValue?: number) {
    this.selectedPclValue = pclValue;
    this.selectedAggregate = aggregate;
    this.refresh(true).subscribe();
  }

  toggleGroupingAttribute(attribute: MetricAttributeSelection) {
    attribute.selected = !attribute.selected;
    this.refresh(true).subscribe();
  }

  private composeRequestFilter(metricKey: string): string {
    let filterItems: FilterBarItem[] = [
      {
        attributeName: 'metricType',
        type: FilterBarItemType.FREE_TEXT,
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
          this.item.chartSettings!.filters,
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
          this.prepareState(this.item);
          this.refresh(true).subscribe();
        }
      });
  }

  private createChart(response: TimeSeriesAPIResponse): void {
    const hasSecondaryAxes = !!this.item.chartSettings!.secondaryAxes;
    let secondaryAxesAggregation = this.item.chartSettings!.secondaryAxes?.aggregation as ChartAggregation;
    const groupDimensions = this.getChartGrouping();
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const primaryAxes = this.item.chartSettings!.primaryAxes!;
    const primaryAggregation = this.selectedAggregate!;
    const secondaryAxesData: (number | undefined)[] = [];
    const series: TSChartSeries[] = response.matrix.map((series: BucketResponse[], i: number) => {
      const labelItems = this.getSeriesKeys(response.matrixKeys[i], groupDimensions);
      const seriesKey = labelItems.join(' | ');
      const color =
        primaryAxes.renderingSettings?.seriesColors?.[seriesKey] || this.context.keywordsContext.getColor(seriesKey);

      if (hasSecondaryAxes)
        response.matrix[i].forEach((b: BucketResponse, j: number) => {
          const bucketValue = this.getBucketValue(b, secondaryAxesAggregation);
          if (secondaryAxesData[j] == undefined) {
            secondaryAxesData[j] = bucketValue;
          } else if (bucketValue) {
            secondaryAxesData[j]! += bucketValue;
          }
        });

      return {
        id: seriesKey,
        scale: '1',
        label: seriesKey,
        labelItems: labelItems,
        legendName: seriesKey,
        data: series.map((b) => this.getBucketValue(b, primaryAggregation!)),
        value: (self, x) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(x),
        stroke: color,
        fill: (self, seriesIdx: number) => this._uPlotUtils.gradientFill(self, color),
        points: { show: false },
        show: true,
      };
    });
    const primaryUnit = primaryAxes.unit!;
    const yAxesUnit = this.getUnitLabel(primaryAggregation, primaryUnit);

    const axes: Axis[] = [
      {
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        scale: '1',
        values: (u, vals) => {
          return vals.map((v: any) => this.getAxesFormatFunction(primaryAggregation, primaryUnit)(v));
        },
      },
    ];
    if (hasSecondaryAxes) {
      axes.push({
        // @ts-ignore
        scale: TimeSeriesConfig.SECONDARY_AXES_KEY,
        side: 1,
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        values: (u: unknown, vals: number[]) =>
          vals.map((v) =>
            this.getAxesFormatFunction(
              this.item.chartSettings!.secondaryAxes!.aggregation as ChartAggregation,
              undefined,
            )(v),
          ),
        grid: { show: false },
      });
      series.unshift({
        scale: TimeSeriesConfig.SECONDARY_AXES_KEY,
        labelItems: ['Total'],
        id: 'total',
        data: secondaryAxesData,
        value: (x, v: number) => Math.trunc(v) + ' total',
        fill: TimeSeriesConfig.TOTAL_BARS_COLOR,
        paths: ChartGenerators.barsFunction({ size: [1, 100, 4], radius: 0.2, gap: 1 }),
        points: { show: false },
      });
    }

    this._internalSettings = {
      title: this.getChartTitle(),
      xValues: xLabels,
      series: series,
      tooltipOptions: {
        enabled: true,
        zAxisLabel: this.getSecondAxesLabel(),
        yAxisUnit: yAxesUnit,
      },
      showLegend: groupDimensions.length > 0, // in case it has grouping, display the legend
      axes: axes,
    };
    groupDimensions.forEach((attributeKey, i) => {
      const attribute = this._attributesByIds[attributeKey];
      const entityName = attribute?.metadata['entity'];
      if (!entityName) {
        return;
      }
      switch (entityName) {
        case 'execution':
          this.fetchAndSetLabels(
            series,
            i,
            (ids) => this._timeSeriesUtilityService.getExecutionByIds(ids),
            (e: Execution) => e.description!,
          );
          break;
        case 'plan':
          this.fetchAndSetLabels(
            series,
            i,
            (ids) => this._timeSeriesUtilityService.getPlansByIds(ids),
            (plan: Plan) => plan.attributes?.['name'],
          );
          break;
        case 'task':
          this.fetchAndSetLabels(
            series,
            i,
            (ids) => this._timeSeriesUtilityService.getTasksByIds(ids),
            (task: ExecutiontTaskParameters) => task.attributes?.['name'],
          );
          break;
      }
    });
  }

  private getSecondAxesLabel(): string | undefined {
    const aggregation = this.item.chartSettings!.secondaryAxes?.aggregation;
    switch (aggregation) {
      case ChartAggregation.RATE:
        return 'Total Hits/h';
      case ChartAggregation.PERCENTILE:
        return 'Total PCL ' + this.item.chartSettings!.secondaryAxes!.pclValue;
      default:
        return 'Total ' + aggregation;
    }
  }

  private getChartTitle(): string {
    let title = this.item.name;
    let aggregationValue: string = this.selectedAggregate as string;
    if (aggregationValue === (ChartAggregation.PERCENTILE as string)) {
      aggregationValue += ` ${this.selectedPclValue}`;
    }
    return `${title} (${aggregationValue})`;
  }

  private fetchDataAndCreateChart(): Observable<TimeSeriesAPIResponse> {
    const settings = this.item.chartSettings!;
    const groupDimensions = this.getChartGrouping();
    const request: FetchBucketsRequest = {
      start: this.context.getSelectedTimeRange().from,
      end: this.context.getSelectedTimeRange().to,
      groupDimensions: groupDimensions,
      oqlFilter: this.composeRequestFilter(settings.metricKey!),
      percentiles: this.getRequiredPercentiles(),
    };
    const customResolution = this.context.getChartsResolution();
    if (customResolution) {
      request.intervalSize = customResolution;
    } else {
      request.numberOfBuckets = 100;
    }
    return this._timeSeriesService.getTimeSeries(request).pipe(
      tap((response) => {
        this.createChart(response);
      }),
    );
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

  /**
   * Function that updates the label of a series, which was not able to be fetched for more information
   * @param label
   * @private
   */
  private updateFailedToLoadLabel(label: string): string {
    return label + ' (unresolved)';
  }

  private getChartGrouping(): string[] {
    if (this.item!.chartSettings!.inheritGlobalGrouping) {
      return this.context.getGroupDimensions();
    } else {
      return this.groupingSelection.filter((s) => s.selected).map((a) => a.name!);
    }
  }

  private getAxesFormatFunction(aggregation: ChartAggregation, unit?: string): (v: number) => string {
    if (aggregation === ChartAggregation.RATE) {
      return (v) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(v) + '/h';
    }
    if (!unit) {
      return TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber;
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

  private getUnitLabel(aggregation: ChartAggregation, unit: string): string {
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

  private getRequiredPercentiles(): number[] {
    const aggregate = this.selectedAggregate;
    const secondaryAggregate = this.item.chartSettings!.secondaryAxes?.aggregation;
    const percentilesToRequest: number[] = [];
    if (aggregate === ChartAggregation.MEDIAN || secondaryAggregate === ChartAggregation.MEDIAN) {
      percentilesToRequest.push(50);
    }
    if (aggregate === ChartAggregation.PERCENTILE || secondaryAggregate === ChartAggregation.PERCENTILE) {
      percentilesToRequest.push(80, 90, 99);
    }
    return percentilesToRequest;
  }

  private getBucketValue(b: BucketResponse, aggregation: ChartAggregation): number | undefined {
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
        return b.pclValues?.[this.selectedPclValue || this.PCL_VALUES[0]];
      default:
        throw new Error('Unhandled aggregation value: ' + aggregation);
    }
  }

  private getSeriesKeys(attributes: BucketAttributes, groupDimensions: string[]): (string | undefined)[] {
    return groupDimensions.map((field) => attributes?.[field]);
  }
}
