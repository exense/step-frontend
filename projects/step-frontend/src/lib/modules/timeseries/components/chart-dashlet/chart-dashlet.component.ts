import { Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import {
  BucketResponse,
  DashboardItem,
  FetchBucketsRequest,
  MetricAttribute,
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
import { forkJoin, Observable, of, Subscription, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ChartDashletSettingsComponent } from '../chart-dashlet-settings/chart-dashlet-settings.component';
import { Axis } from 'uplot';
import { ChartGenerators } from '../../modules/legacy/injectables/chart-generators';
import { ChartAggregation } from '../../modules/_common/types/chart-aggregation';
import { ChartDashlet } from '../../modules/_common/types/chart-dashlet';
import { TimeSeriesSyncGroup } from '../../modules/_common/types/time-series/time-series-sync-group';

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
export class ChartDashletComponent extends ChartDashlet implements OnInit {
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

  syncGroupSubscription?: Subscription;

  ngOnInit(): void {
    if (!this.item || !this.context || !this.height) {
      throw new Error('Missing input values');
    }
    this.prepareState(this.item);
    this.fetchDataAndCreateChart().subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cItem = changes['item'];
    if (cItem?.previousValue !== cItem?.currentValue && !cItem?.firstChange) {
      this.prepareState(cItem.currentValue);
      this.refresh(true).subscribe();
    }
  }

  private subscribeToMasterDashletChanges() {
    this.syncGroupSubscription?.unsubscribe();
    this.syncGroupSubscription = new Subscription();
    if (this.item.masterChartId) {
      let syncGroup = this.context.getSyncGroup(this.item.masterChartId);
      this.syncGroupSubscription.add(
        syncGroup.onSeriesShow().subscribe((s) => {
          this.chart.showSeries(s);
        }),
      );
      this.syncGroupSubscription.add(
        syncGroup.onSeriesHide().subscribe((s) => {
          this.chart.hideSeries(s);
        }),
      );
      this.syncGroupSubscription.add(
        syncGroup.onAllSeriesShow().subscribe(() => {
          this.chart.showAllSeries();
        }),
      );
      this.syncGroupSubscription.add(
        syncGroup.onAllSeriesHide().subscribe(() => {
          this.chart.hideAllSeries();
        }),
      );
    }
  }

  private prepareState(item: DashboardItem) {
    item.attributes?.forEach((attr) => (this._attributesByIds[attr.name] = attr));
    this.groupingSelection = this.prepareGroupingAttributes(item);
    this.selectedAggregate = item.chartSettings!.primaryAxes!.aggregation as ChartAggregation;
    this.selectedPclValue = item.chartSettings!.primaryAxes!.pclValue;
    if (this.selectedAggregate === ChartAggregation.PERCENTILE && !this.selectedPclValue) {
      this.selectedPclValue = this.PCL_VALUES[0];
    }
    this.subscribeToMasterDashletChanges();
  }

  private prepareGroupingAttributes(item: DashboardItem): MetricAttributeSelection[] {
    const groupingSelection: MetricAttributeSelection[] =
      item.attributes?.map((a) => ({ ...a, selected: false })) || [];
    item.grouping?.forEach((a) => {
      const foundAttribute = groupingSelection.find((attr) => attr.name === a);
      if (foundAttribute) {
        foundAttribute.selected = true;
      }
    });
    return groupingSelection;
  }

  public refresh(blur?: boolean): Observable<any> {
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

  private getMasterChart(): DashboardItem | undefined {
    return this.item.masterChartId ? this.context.getDashlet(this.item.masterChartId) : undefined;
  }

  private composeRequestFilter(): string {
    const masterChart = this.getMasterChart();
    const metric = masterChart?.metricKey || this.item.metricKey;
    let metricFilterItem = {
      attributeName: 'metricType',
      type: FilterBarItemType.FREE_TEXT,
      exactMatch: true,
      freeTextValues: [`"${metric}"`],
      searchEntities: [],
    };
    let filterItems: FilterBarItem[] = [];

    const itemToInheritSettingsFrom = masterChart || this.item;
    if (itemToInheritSettingsFrom.inheritGlobalFilters) {
      filterItems = FilterUtils.combineGlobalWithChartFilters(
        this.context.getFilteringSettings().filterItems,
        itemToInheritSettingsFrom.filters,
      );
    } else {
      filterItems = itemToInheritSettingsFrom.filters.map(FilterUtils.convertApiFilterItem);
    }
    filterItems.unshift(metricFilterItem);
    return FilterUtils.filtersToOQL(filterItems, 'attributes');
  }

  handleLockStateChange(locked: boolean) {
    this.context.setChartsLockedState(locked);
  }

  openChartSettings(): void {
    this._matDialog
      .open(ChartDashletSettingsComponent, { data: { item: this.item, context: this.context } })
      .afterClosed()
      .subscribe((updatedItem) => {
        this.handleChartUpdate(updatedItem);
      });
  }

  private handleChartUpdate(updatedItem: DashboardItem) {
    if (updatedItem) {
      Object.assign(this.item, updatedItem);
      this.prepareState(this.item);
      this.refresh(true).subscribe();
    }
  }

  /**
   * When there is no grouping, the key and label will be 'Value'.
   * If there are grouping, all empty elements will be replaced with an empty label
   */
  private createChart(response: TimeSeriesAPIResponse): void {
    let syncGroup: TimeSeriesSyncGroup | undefined;
    if (this.item.masterChartId) {
      syncGroup = this.context.getSyncGroup(this.item.masterChartId);
    }
    const hasSecondaryAxes = !!this.item.chartSettings!.secondaryAxes;
    const hasExecutionLinks = !!this._attributesByIds[TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE];
    const secondaryAxesAggregation = this.item.chartSettings!.secondaryAxes?.aggregation as ChartAggregation;
    const groupDimensions = this.getGroupDimensions();
    const xLabels = TimeSeriesUtils.createTimeLabels(response.start, response.end, response.interval);
    const primaryAxes = this.item.chartSettings!.primaryAxes!;
    const primaryAggregation = this.selectedAggregate!;
    const secondaryAxesData: (number | undefined)[] = [];
    const series: TSChartSeries[] = response.matrix.map((series: BucketResponse[], i: number) => {
      const metadata: any[] = []; // here we can store meta info, like execution links or other attributes
      const labelItems = groupDimensions.map((field) => response.matrixKeys[i]?.[field]);
      const seriesKey = this.mergeLabelItems(labelItems);
      const color =
        primaryAxes.renderingSettings?.seriesColors?.[seriesKey] || this.context.keywordsContext.getColor(seriesKey);

      if (hasExecutionLinks || hasSecondaryAxes) {
        response.matrix[i].forEach((b: BucketResponse, j: number) => {
          metadata.push(b?.attributes);
          if (hasSecondaryAxes) {
            const bucketValue = this.getBucketValue(b, secondaryAxesAggregation);
            if (secondaryAxesData[j] == undefined) {
              secondaryAxesData[j] = bucketValue;
            } else if (bucketValue) {
              secondaryAxesData[j]! += bucketValue;
            }
          }
        });
      }

      const s: TSChartSeries = {
        id: seriesKey,
        scale: 'y',
        label: seriesKey,
        labelItems: labelItems,
        legendName: seriesKey,
        data: series.map((b) => this.getBucketValue(b, primaryAggregation!)),
        metadata: metadata,
        value: (self, x) => TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.bigNumber(x),
        stroke: color,
        points: { show: false },
        show: syncGroup ? syncGroup?.seriesShouldBeVisible(seriesKey) : true,
      };
      if (primaryAxes.colorizationType === 'FILL') {
        s.fill = (self, seriesIdx: number) => this._uPlotUtils.gradientFill(self, color);
      }
      return s;
    });
    const primaryUnit = primaryAxes.unit!;
    const yAxesUnit = this.getUnitLabel(primaryAggregation, primaryUnit);

    const axes: Axis[] = [
      {
        size: TimeSeriesConfig.CHART_LEGEND_SIZE,
        scale: 'y',
        values: (u, vals) => {
          return vals.map((v: any) => this.getAxesFormatFunction(primaryAggregation, primaryUnit)(v));
        },
      },
    ];

    this.fetchLegendEntities(series).subscribe();

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
        useExecutionLinks: hasExecutionLinks,
      },
      showLegend: groupDimensions.length > 0, // in case it has grouping, display the legend
      axes: axes,
    };
  }

  private mergeLabelItems(items: (string | undefined)[]): string {
    if (items.length === 0) {
      return TimeSeriesConfig.SERIES_LABEL_VALUE;
    }
    return items.map((i) => i ?? TimeSeriesConfig.SERIES_LABEL_EMPTY).join(' | ');
  }

  private getSecondAxesLabel(): string | undefined {
    const aggregation = this.item.chartSettings!.secondaryAxes?.aggregation;
    switch (aggregation) {
      case ChartAggregation.RATE:
        return 'Total Hits/h';
      default:
        return 'Overall ' + aggregation;
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
    const groupDimensions = this.getGroupDimensions();
    const request: FetchBucketsRequest = {
      start: this.context.getSelectedTimeRange().from,
      end: this.context.getSelectedTimeRange().to,
      groupDimensions: groupDimensions,
      oqlFilter: this.composeRequestFilter(),
      percentiles: this.getRequiredPercentiles(),
    };
    const customResolution = this.context.getChartsResolution();
    if (customResolution) {
      request.intervalSize = customResolution;
    } else {
      request.numberOfBuckets = 100;
    }
    if (!!this._attributesByIds[TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE]) {
      // has execution attribute
      request.collectAttributeKeys = [TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE];
      request.collectAttributesValuesLimit = 10;
    }
    return this._timeSeriesService.getTimeSeries(request).pipe(
      tap((response) => {
        this.createChart(response);
      }),
    );
  }

  private fetchLegendEntities(series: TSChartSeries[]): Observable<any> {
    const groupDimensions = this.getGroupDimensions();
    const requests$ = groupDimensions
      .map((attributeKey, i) => {
        const attribute = this._attributesByIds[attributeKey];
        const entityName = attribute?.metadata['entity'];
        if (!entityName) {
          return undefined;
        }
        const entityIds: Set<string> = new Set<string>(series.map((s) => s.labelItems[i]!).filter((v) => !!v));
        if (entityIds.size === 0) {
          of(undefined);
        }
        return this._timeSeriesUtilityService.getEntitiesNamesByIds(Array.from(entityIds.values()), entityName).pipe(
          tap((response) => {
            series.forEach((s, j) => {
              const labelId = s.labelItems[i];
              if (labelId) {
                let newLabel;
                if (response[labelId]) {
                  newLabel = response[labelId];
                } else {
                  newLabel = labelId + ' (unresolved)';
                }
                this.chart.setLabelItem(s.id, i, newLabel);
              }
            });
          }),
        );
      })
      .filter((x) => !!x);
    return forkJoin(requests$);
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

  private getGroupDimensions(): string[] {
    const masterChart = this.getMasterChart();
    if (masterChart) {
      if (masterChart.inheritGlobalGrouping) {
        return this.context.getGroupDimensions();
      } else {
        return masterChart.grouping;
      }
    } else {
      if (this.item.inheritGlobalGrouping) {
        return this.context.getGroupDimensions();
      } else {
        return this.groupingSelection.filter((s) => s.selected).map((a) => a.name!);
      }
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

  getType(): 'TABLE' | 'CHART' {
    return 'CHART';
  }

  showSeries(key: string): void {
    throw new Error('Method not implemented.');
  }
  hideSeries(key: string): void {
    throw new Error('Method not implemented.');
  }
}
