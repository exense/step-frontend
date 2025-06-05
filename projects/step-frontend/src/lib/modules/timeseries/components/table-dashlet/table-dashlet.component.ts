import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  TimeSeriesConfig,
  TimeSeriesContext,
  TimeSeriesEntityService,
} from '../../modules/_common';
import { ChartSkeletonComponent } from '../../modules/chart';
import {
  AggregatorType,
  BucketResponse,
  ColumnSelection,
  DashboardItem,
  FetchBucketsRequest,
  MarkerType,
  MetricAttribute,
  TableDashletSettings,
  TableLocalDataSource,
  TableLocalDataSourceConfig,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { TsComparePercentagePipe } from './ts-compare-percentage.pipe';
import { TableColumnType } from '../../modules/_common/types/table-column-type';
import { BehaviorSubject, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { ChartDashlet } from '../../modules/_common/types/chart-dashlet';
import { MatDialog } from '@angular/material/dialog';
import { TableDashletSettingsComponent } from '../table-dashlet-settings/table-dashlet-settings.component';
import { TableEntryFormatPipe } from './table-entry-format.pipe';
import { SeriesStroke } from '../../modules/_common/types/time-series/series-stroke';
import { ChartAggregation } from '../../modules/_common/types/chart-aggregation';
import { MatTooltip } from '@angular/material/tooltip';

interface TableColumn {
  id: string;
  // type: TableColumnType;
  label: string;
  subLabel?: string;
  pclValue?: number;
  mapValue: (bucket: ProcessedBucket) => any;
  mapDiffValue: (entry: TableEntry) => number | undefined;
  isVisible: boolean;
}

export interface TableEntry {
  name: string; // series id
  groupingLabels: string[]; // each grouping attribute will have a label
  base?: ProcessedBucket;
  compare?: ProcessedBucket;
  stroke: SeriesStroke;
  pclValues: number[];
  isSelected?: boolean;
  countDiff?: number;
  sumDiff?: number;
  avgDiff?: number;
  minDiff?: number;
  maxDiff?: number;
  pcl1Diff?: number;
  pcl2Diff?: number;
  pcl3Diff?: number;
  tpsDiff?: number;
  tphDiff?: number;
}

interface ProcessedBucket extends BucketResponse {
  seriesKey: string;
  stroke: SeriesStroke;
  avg: number;
  tps: number;
  tph: number;
  selected: boolean;
}

interface ProcessedBucketResponse {
  buckets: ProcessedBucket[];
  truncated: boolean;
}

@Component({
  selector: 'step-table-dashlet',
  templateUrl: './table-dashlet.component.html',
  styleUrls: ['./table-dashlet.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [COMMON_IMPORTS, ChartSkeletonComponent, TsComparePercentagePipe, TableEntryFormatPipe, MatTooltip],
})
export class TableDashletComponent extends ChartDashlet implements OnInit, OnChanges {
  readonly COMPARE_COLUMN_ID_SUFFIX = '_comp';
  readonly DIFF_COLUMN_ID_SUFFIX = '_diff';

  @Input() item!: DashboardItem;
  @Input() context!: TimeSeriesContext;
  @Input() editMode = false;

  @Output() remove = new EventEmitter();
  @Output() shiftLeft = new EventEmitter();
  @Output() shiftRight = new EventEmitter();

  private _timeSeriesService = inject(TimeSeriesService);
  private _matDialog = inject(MatDialog);
  private _timeSeriesEntityService = inject(TimeSeriesEntityService);

  tableData$ = new BehaviorSubject<TableEntry[]>([]);
  tableDataSource: TableLocalDataSource<TableEntry> | undefined;
  tableIsLoading = true;

  columnsDefinition: TableColumn[] = [];
  visibleColumnsIds: string[] = ['name'];
  attributesByIds: Record<string, MetricAttribute> = {};

  allSeriesChecked: boolean = true;
  showHigherResolutionWarning = false;

  compareModeEnabled: boolean = false;
  compareContext: TimeSeriesContext | undefined;
  truncated?: boolean;
  baseBuckets: ProcessedBucket[] = []; // for caching
  compareBuckets: ProcessedBucket[] = []; // for caching

  baseRequestOql: string = '';
  compareRequestOql: string = '';

  ngOnInit(): void {
    if (!this.item) {
      throw new Error('Dashlet item cannot be undefined');
    }
    this.prepareState();
    this.tableDataSource = new TableLocalDataSource(this.tableData$, this.getDatasourceConfig());
    this.fetchBaseData().subscribe(() => this.updateTableData());
  }

  refresh(blur?: boolean): Observable<any> {
    return this.fetchBaseData().pipe(tap(() => this.updateTableData()));
  }

  refreshCompareData(): Observable<any> {
    return this.fetchData(true).pipe(
      tap((response) => {
        this.compareBuckets = response.buckets;
        this.truncated = response.truncated;
        this.updateTableData();
      }),
    );
  }

  private prepareState() {
    this.item.attributes?.forEach((attr) => (this.attributesByIds[attr.name] = attr));
    this.columnsDefinition = this.item.tableSettings!.columns!.map((column: ColumnSelection) => {
      return {
        id: column.column!,
        label: this.getColumnLabel(column),
        isVisible: column.selected!,
        pclValue: column.aggregation.params?.['pclValue'],
        mapValue: this.getBucketMapFunction(column),
        mapDiffValue: ColumnsDiffFunctions[column.column!],
      };
    });
    this.updateVisibleColumns();
  }

  private getColumnLabel(column: ColumnSelection): string {
    switch (column.aggregation.type) {
      case ChartAggregation.PERCENTILE:
        const pcl = column.aggregation.params?.['pclValue'];
        return `Pcl. ${pcl || 90}`;
      case ChartAggregation.RATE:
        const rateUnit = column.aggregation.params?.['rateUnit'];
        switch (rateUnit) {
          case 's':
            return 'Tps';
          case 'h':
            return 'Tph';
          default:
            return 'Throughput';
        }
      default:
        return AggregateLabels[column.aggregation.type];
    }
  }

  private getBucketMapFunction(column: ColumnSelection): (bucket: ProcessedBucket) => any {
    switch (column.aggregation.type) {
      case 'PERCENTILE':
        const pcl = column.aggregation.params?.['pclValue'];
        return (b: ProcessedBucket) => b?.pclValues![this.getPclWithDecimals(pcl)];
      case 'RATE':
        const rateUnit = column.aggregation.params?.['rateUnit'];
        switch (rateUnit) {
          case 's':
            return (b: ProcessedBucket) => b?.tps;
          case 'h':
          default:
            return (b: ProcessedBucket) => b?.tph;
        }
      default:
        return ColumnsValueFunctions[column.aggregation.type];
    }
  }

  private getPclWithDecimals(value: number) {
    if (Math.floor(value) === value) return value.toFixed(1);
    return value;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cItem = changes['item'];
    if (cItem?.previousValue !== cItem?.currentValue && !cItem?.firstChange) {
      this.prepareState();
      this.refresh(true).subscribe();
    }
  }

  enableCompareMode(context: TimeSeriesContext) {
    this.compareModeEnabled = true;
    this.compareContext = context;
    this.compareBuckets = this.baseBuckets;
    this.compareRequestOql = this.baseRequestOql;
    this.updateVisibleColumns();
    this.updateTableData();
  }

  disableCompareMode() {
    this.compareModeEnabled = false;
    this.compareContext = undefined;
    this.compareBuckets = [];
    this.updateVisibleColumns();
    this.updateTableData();
  }

  updateVisibleColumns(): void {
    let visibleColumns = this.columnsDefinition
      .filter((col) => col.isVisible)
      .map((col) => {
        if (this.compareModeEnabled) {
          return [col.id, col.id + this.COMPARE_COLUMN_ID_SUFFIX, col.id + this.DIFF_COLUMN_ID_SUFFIX];
        } else {
          return [col.id];
        }
      })
      .flat();
    visibleColumns.unshift('name');
    this.visibleColumnsIds = visibleColumns;
  }

  onColumnVisibilityChange(column: TableColumn): void {
    let columnDefinition = this.columnsDefinition.find((c) => c.id === column.id)!;
    columnDefinition.isVisible = !columnDefinition.isVisible;
    this.item.tableSettings!.columns.find((c) => c.column === column.id)!.selected = columnDefinition.isVisible;
    // update the chart settings
    this.updateVisibleColumns();
  }

  onColumnPclValueChange(column: TableColumn, value: string) {
    const oldValue = column.pclValue;
    let parsedNumber: number = parseFloat(value);
    const validPclValue = !isNaN(parsedNumber) && parsedNumber > 0 && parsedNumber < 100;
    if (validPclValue) {
      column.pclValue = parsedNumber;
      this.item.tableSettings!.columns.find((c) => c.column === column.id)!.aggregation!.params!['pclValue'] =
        parsedNumber;
      this.prepareState();
      this.refresh(true).subscribe(() => {
        if (this.compareModeEnabled) {
          this.refreshCompareData().subscribe();
        }
      });
    } else {
      column.pclValue = 0;
      setTimeout(() => (column.pclValue = oldValue), 100);
    }
  }

  private getGroupDimensions(context: TimeSeriesContext): string[] {
    return this.item.inheritGlobalGrouping ? context.getGroupDimensions() : this.item.grouping;
  }

  private fetchData(compareData: boolean) {
    const context = compareData ? this.compareContext! : this.context;
    const oql = this.composeRequestFilter(context);
    if (compareData) {
      this.compareRequestOql = oql;
    } else {
      this.baseRequestOql = oql;
    }
    const request: FetchBucketsRequest = {
      start: context.getSelectedTimeRange().from,
      end: context.getSelectedTimeRange().to,
      groupDimensions: this.getGroupDimensions(context),
      oqlFilter: oql,
      numberOfBuckets: 1,
      percentiles: this.columnsDefinition.filter((c) => !!c.pclValue).map((c) => c.pclValue!),
    };
    return this._timeSeriesService
      .getMeasurements(request)
      .pipe(map((response) => this.processResponse(response, context)));
  }

  private fetchBaseData(): Observable<ProcessedBucketResponse> {
    return this.fetchData(false).pipe(
      tap((response) => {
        this.baseBuckets = response.buckets;
        this.truncated = response.truncated;
      }),
    );
  }

  private mergeBaseAndCompareData(): TableEntry[] {
    const baseBuckets = this.baseBuckets;
    const compareBuckets = this.compareBuckets;
    const baseBucketsByIds: Record<string, ProcessedBucket> = baseBuckets.reduce(
      (obj, current) => {
        obj[current.seriesKey] = current;
        return obj;
      },
      {} as Record<string, ProcessedBucket>,
    );
    const compareBucketsByIds: Record<string, ProcessedBucket> = compareBuckets.reduce(
      (obj, current) => {
        obj[current.seriesKey] = current;
        return obj;
      },
      {} as Record<string, ProcessedBucket>,
    );
    let allSeriesIds: string[] = [
      ...new Set([...Object.keys(baseBucketsByIds), ...(compareBuckets ? Object.keys(compareBucketsByIds) : [])]),
    ];
    allSeriesIds = allSeriesIds.sort();
    const pclValues: number[] = this.columnsDefinition.filter((c) => !!c.pclValue).map((c) => c.pclValue!);
    const entries: TableEntry[] = allSeriesIds.map((keyword) => {
      const baseBucket: ProcessedBucket = baseBucketsByIds[keyword];
      const compareBucket: ProcessedBucket = compareBucketsByIds[keyword];
      const hasOnlyCompareData = !!compareBucket && !baseBucket;
      const labelItems = this.getGroupDimensions(hasOnlyCompareData ? this.compareContext! : this.context).map(
        (a) => (baseBucket || compareBucket).attributes[a],
      );
      return {
        name: keyword,
        pclValues: this.columnsDefinition.filter((c) => !!c.pclValue).map((c) => c.pclValue!),
        base: baseBucket,
        compare: compareBucket,
        groupingLabels: labelItems,
        // can use the same sync group because it is shared
        isSelected: this.context
          .getSyncGroup(this.item.id)
          .seriesShouldBeVisible(baseBucket?.seriesKey || compareBucket?.seriesKey),
        stroke: baseBucketsByIds[keyword]?.stroke || compareBucketsByIds[keyword]?.stroke,
        countDiff: this.percentageBetween(baseBucket?.count, compareBucket?.count),
        sumDiff: this.percentageBetween(baseBucket?.sum, compareBucket?.sum),
        avgDiff: this.percentageBetween(baseBucket?.avg, compareBucket?.avg),
        minDiff: this.percentageBetween(baseBucket?.min, compareBucket?.min),
        maxDiff: this.percentageBetween(baseBucket?.max, compareBucket?.max),
        pcl1Diff: this.percentageBetween(
          baseBucket?.pclValues?.[this.getPclWithDecimals(pclValues[0])],
          compareBucket?.pclValues?.[this.getPclWithDecimals(pclValues[0])],
        ),
        pcl2Diff: this.percentageBetween(
          baseBucket?.pclValues?.[this.getPclWithDecimals(pclValues[1])],
          compareBucket?.pclValues?.[this.getPclWithDecimals(pclValues[1])],
        ),
        pcl3Diff: this.percentageBetween(
          baseBucket?.pclValues?.[this.getPclWithDecimals(pclValues[2])],
          compareBucket?.pclValues?.[this.getPclWithDecimals(pclValues[2])],
        ),
        tpsDiff: this.percentageBetween(baseBucket?.tps, compareBucket?.tps),
        tphDiff: this.percentageBetween(baseBucket?.tph, compareBucket?.tph),
      };
    });
    return entries;
  }

  private updateTableData() {
    const tableEntries = this.mergeBaseAndCompareData();
    this.fetchLegendEntities(tableEntries).subscribe((updatedData) => {
      this.tableData$.next(updatedData);
      this.tableIsLoading = false;
    });
  }

  private processResponse(response: TimeSeriesAPIResponse, context: TimeSeriesContext): ProcessedBucketResponse {
    this.showHigherResolutionWarning = response.higherResolutionUsed;
    const syncGroup = context.getSyncGroup(this.item.id);
    const buckets = response.matrix.map((series, i) => {
      if (series.length != 1) {
        // we should have just one bucket
        throw new Error('More than one bucket was provided');
      }
      const seriesAttributes = response.matrixKeys[i];
      const responseBucket = series[0];
      responseBucket.attributes = seriesAttributes;
      const groupingLabels = this.getGroupDimensions(context).map((field) => seriesAttributes[field]);
      const seriesKey = this.mergeLabelItems(groupingLabels);
      return {
        ...responseBucket,
        seriesKey: seriesKey,
        stroke: context.getStrokeColor(seriesKey),
        avg: Math.round(responseBucket.sum / responseBucket.count),
        tps: Math.round(responseBucket.count / ((response.end! - response.start!) / 1000)),
        tph: Math.round((responseBucket.count / ((response.end! - response.start!) / 1000)) * 3600),
        selected: syncGroup.seriesShouldBeVisible(seriesKey),
      } as ProcessedBucket;
    });
    const truncated = response.truncated;
    return { buckets, truncated };
  }

  onAllSeriesCheckboxClick(checked: boolean) {
    this.context.getSyncGroup(this.item.id).setAllSeriesChecked(checked);

    this.tableData$.getValue().forEach((entry) => {
      entry.isSelected = checked;
    });
  }

  onKeywordToggle(entry: TableEntry, selected: boolean) {
    const seriesKey = (entry.base?.seriesKey || entry.compare?.seriesKey)!;
    let syncGroup = this.context.getSyncGroup(this.item.id);
    if (selected) {
      syncGroup.showSeries(seriesKey);
    } else {
      this.allSeriesChecked = false;
      syncGroup.hideSeries(seriesKey);
    }
  }

  openSettings(): void {
    this._matDialog
      .open(TableDashletSettingsComponent, { data: { item: this.item, context: this.context } })
      .afterClosed()
      .subscribe((updatedItem: DashboardItem) => {
        if (updatedItem) {
          Object.assign(this.item, updatedItem);
          this.prepareState();
          this.refresh(true).subscribe();
        }
      });
  }

  private mergeLabelItems(items: (string | undefined)[]): string {
    if (items.length === 0) {
      // there was no grouping
      return TimeSeriesConfig.SERIES_LABEL_VALUE;
    }
    return items.map((i) => i ?? TimeSeriesConfig.SERIES_LABEL_EMPTY).join(' | ');
  }

  private fetchLegendEntities(data: TableEntry[]): Observable<TableEntry[]> {
    const baseDimensions = this.getGroupDimensions(this.context);
    const compareDimensions = this.compareContext ? this.getGroupDimensions(this.compareContext) : [];
    const entitiesByTypes: Record<string, Set<string>> = {};
    data.forEach((entry) => {
      let useCompareContext = entry.compare && !entry.base;
      const dimensions = useCompareContext ? compareDimensions : baseDimensions;
      dimensions.forEach((key, i) => {
        const attribute = this.attributesByIds[key];
        const entityName = attribute?.metadata['entity'];
        if (!entityName) {
          return;
        }
        const entityId = entry.groupingLabels[i];
        if (!entityId) {
          return;
        }
        const entitiesSet = entitiesByTypes[entityName] || new Set();
        entitiesSet.add(entityId);
        entitiesByTypes[entityName] = entitiesSet;
      });
    });
    const requestTypes = Object.keys(entitiesByTypes);
    const requestTypesIndexes: Record<string, number> = {}; // used for fast access of responses
    requestTypes.forEach((type, i) => (requestTypesIndexes[type] = i));
    const requests$ = requestTypes.map((entityType) =>
      this._timeSeriesEntityService.getEntityNames(Array.from(entitiesByTypes[entityType]), entityType),
    );
    if (requests$.length === 0) {
      return of(data);
    }
    return forkJoin(requests$).pipe(
      map((responses: Record<string, string>[]) => {
        return data.map((entry) => {
          const useCompareContext = entry.compare && !entry.base;
          const dimensions = useCompareContext ? compareDimensions : baseDimensions;
          dimensions.forEach((key, i) => {
            const attribute = this.attributesByIds[key];
            const entityType = attribute?.metadata['entity'];
            if (!entityType) {
              return;
            }
            const entityId = entry.groupingLabels[i];

            const entityName = responses[requestTypesIndexes[entityType]][entityId];
            entry.groupingLabels[i] = entityName ? entityName : entry.groupingLabels[i] + ' (unresolved)';
            entry.name = this.mergeLabelItems(entry.groupingLabels);
          });
          return entry;
        });
      }),
    );
  }

  getDatasourceConfig(): TableLocalDataSourceConfig<TableEntry> {
    return TableLocalDataSource.configBuilder<TableEntry>()
      .addSortStringPredicate('name', (item) => item.base?.attributes['name'])
      .addSortNumberPredicate('COUNT', (item) => item.base?.count)
      .addSortNumberPredicate('COUNT_comp', (item) => item.compare?.count)
      .addSortNumberPredicate('COUNT_diff', (item) => item.countDiff)
      .addSortNumberPredicate('SUM', (item) => item.base?.sum)
      .addSortNumberPredicate('SUM_comp', (item) => item.compare?.sum)
      .addSortNumberPredicate('SUM_diff', (item) => item.sumDiff)
      .addSortNumberPredicate('AVG', (item) => item.base?.avg)
      .addSortNumberPredicate('AVG_comp', (item) => item.compare?.avg)
      .addSortNumberPredicate('AVG_diff', (item) => item.avgDiff)
      .addSortNumberPredicate('MIN', (item) => item.base?.min)
      .addSortNumberPredicate('MIN_comp', (item) => item.compare?.min)
      .addSortNumberPredicate('MIN_diff', (item) => item.minDiff)
      .addSortNumberPredicate('MAX', (item) => item.base?.max)
      .addSortNumberPredicate('MAX_comp', (item) => item.compare?.max)
      .addSortNumberPredicate('MAX_diff', (item) => item.maxDiff)
      .addSortNumberPredicate('PCL_1', (item) => item.base?.pclValues?.[this.getPclWithDecimals(item.pclValues[0])])
      .addSortNumberPredicate(
        'PCL_1_comp',
        (item) => item.compare?.pclValues?.[this.getPclWithDecimals(item.pclValues[0])],
      )
      .addSortNumberPredicate('PCL_1_diff', (item) => item.pcl1Diff)
      .addSortNumberPredicate('PCL_2', (item) => item.base?.pclValues?.[this.getPclWithDecimals(item.pclValues[1])])
      .addSortNumberPredicate(
        'PCL_2_comp',
        (item) => item.compare?.pclValues?.[this.getPclWithDecimals(item.pclValues[1])],
      )
      .addSortNumberPredicate('PCL_2_diff', (item) => item.pcl2Diff)
      .addSortNumberPredicate('PCL_3', (item) => item.base?.pclValues?.[this.getPclWithDecimals(item.pclValues[2])])
      .addSortNumberPredicate(
        'PCL_3_comp',
        (item) => item.compare?.pclValues?.[this.getPclWithDecimals(item.pclValues[2])],
      )
      .addSortNumberPredicate('PCL_3_diff', (item) => item.pcl3Diff)
      .addSortNumberPredicate('TPS', (item) => item.base?.tps)
      .addSortNumberPredicate('TPS_comp', (item) => item.compare?.tps)
      .addSortNumberPredicate('TPS_diff', (item) => item.tpsDiff)
      .addSortNumberPredicate('TPH', (item) => item.base?.tph)
      .addSortNumberPredicate('TPH_comp', (item) => item.compare?.tph)
      .addSortNumberPredicate('TPH_diff', (item) => item.tphDiff)
      .build();
  }

  percentageBetween(x: number | undefined, y: number | undefined) {
    if (x === undefined || y === undefined || x === 0) {
      return undefined;
    } else {
      return ((y - x) / x) * 100;
    }
  }

  getItem(): DashboardItem {
    return this.item;
  }
  getContext(): TimeSeriesContext {
    throw new Error('Method not implemented.');
  }

  getType(): 'TABLE' | 'CHART' {
    return 'TABLE';
  }
}

const ColumnsValueFunctions: Record<string, any> = {
  [ChartAggregation.COUNT]: (b: ProcessedBucket) => b?.count,
  [ChartAggregation.SUM]: (b: ProcessedBucket) => b?.sum,
  [ChartAggregation.AVG]: (b: ProcessedBucket) => b?.avg,
  [ChartAggregation.MIN]: (b: ProcessedBucket) => b?.min,
  [ChartAggregation.MAX]: (b: ProcessedBucket) => b?.max,
};

const ColumnsDiffFunctions: Record<string, (entry: TableEntry) => number | undefined> = {
  [TableColumnType.COUNT]: (entry: TableEntry) => entry.countDiff,
  [TableColumnType.SUM]: (entry: TableEntry) => entry.sumDiff,
  [TableColumnType.AVG]: (entry: TableEntry) => entry.avgDiff,
  [TableColumnType.PCL_1]: (entry: TableEntry) => entry.pcl1Diff,
  [TableColumnType.PCL_2]: (entry: TableEntry) => entry.pcl2Diff,
  [TableColumnType.PCL_3]: (entry: TableEntry) => entry.pcl3Diff,
  [TableColumnType.MIN]: (entry: TableEntry) => entry.minDiff,
  [TableColumnType.MAX]: (entry: TableEntry) => entry.maxDiff,
  [TableColumnType.TPS]: (entry: TableEntry) => entry.tpsDiff,
  [TableColumnType.TPH]: (entry: TableEntry) => entry.tphDiff,
};

const AggregateLabels: Record<string, string> = {
  [ChartAggregation.COUNT]: 'Count',
  [ChartAggregation.SUM]: 'Sum',
  [ChartAggregation.AVG]: 'Avg',
  [ChartAggregation.MIN]: 'Min',
  [ChartAggregation.MAX]: 'Max',
};
