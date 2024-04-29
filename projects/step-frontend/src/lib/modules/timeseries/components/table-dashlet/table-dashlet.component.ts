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
  TimeSeriesUtilityService,
} from '../../modules/_common';
import { ChartSkeletonComponent } from '../../modules/chart';
import {
  BucketResponse,
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
import { TsComparePercentagePipe } from '../../modules/legacy/pipes/ts-compare-percentage.pipe';
import { TableColumnType } from '../../modules/_common/types/table-column-type';
import { BehaviorSubject, forkJoin, map, Observable, tap } from 'rxjs';
import { ChartDashlet } from '../../modules/_common/types/chart-dashlet';
import { MatDialog } from '@angular/material/dialog';
import { TableDashletSettingsComponent } from '../table-dashlet-settings/table-dashlet-settings.component';
import { TableEntryFormatPipe } from './table-entry-format.pipe';

export interface TableEntry {
  name: string; // series id
  groupingLabels: string[]; // each grouping attribute will have a label
  base?: ProcessedBucket;
  compare?: ProcessedBucket;
  color: string;
  isSelected?: boolean;
  countDiff?: number;
  sumDiff?: number;
  avgDiff?: number;
  minDiff?: number;
  maxDiff?: number;
  pcl80Diff?: number;
  pcl90Diff?: number;
  pcl99Diff?: number;
  tpsDiff?: number;
  tphDiff?: number;
}

interface ProcessedBucket extends BucketResponse {
  seriesKey: string;
  color: string;
  avg: number;
  tps: number;
  tph: number;
  selected: boolean;
}

@Component({
  selector: 'step-table-dashlet',
  templateUrl: './table-dashlet.component.html',
  styleUrls: ['./table-dashlet.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [COMMON_IMPORTS, ChartSkeletonComponent, TsComparePercentagePipe, TableEntryFormatPipe],
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
  private _timeSeriesUtilityService = inject(TimeSeriesUtilityService);

  tableData$ = new BehaviorSubject<TableEntry[]>([]);
  tableDataSource: TableLocalDataSource<TableEntry> | undefined;
  tableIsLoading = true;

  settings!: TableDashletSettings;

  columnsDefinition: TableColumn[] = [];
  visibleColumnsIds: string[] = ['name'];
  attributesByIds: Record<string, MetricAttribute> = {};

  allSeriesChecked: boolean = true;

  compareModeEnabled: boolean = false;
  compareContext: TimeSeriesContext | undefined;
  baseBuckets: ProcessedBucket[] = []; // for caching
  compareBuckets: ProcessedBucket[] = []; // for caching

  readonly MarkerType = MarkerType;

  ngOnInit(): void {
    if (!this.item) {
      throw new Error('Dashlet item cannot be undefined');
    }
    this.prepareState();
    this.tableDataSource = new TableLocalDataSource(this.tableData$, this.getDatasourceConfig());
    this.fetchBaseData().subscribe();
  }

  refresh(blur?: boolean): Observable<any> {
    return this.fetchBaseData();
  }

  refreshCompareData(): Observable<any> {
    const context = this.compareContext!;
    return this.fetchData(context).pipe(
      tap((response) => {
        this.compareBuckets = response;
        this.updateTableData();
      }),
    );
  }

  private prepareState() {
    this.item.attributes?.forEach((attr) => (this.attributesByIds[attr.name] = attr));
    this.columnsDefinition = this.item.tableSettings!.columns!.map((column) => {
      return {
        id: column.column!,
        label: ColumnsLabels[column.column],
        isVisible: column.selected,
        mapValue: ColumnsValueFunctions[column.column!],
        mapDiffValue: ColumnsDiffFunctions[column.column!],
      } as TableColumn;
    });
    this.updateVisibleColumns();
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
    const newVisible = !column.isVisible;
    // update the chart settings
    this.settings.columns.filter((c) => c.column === column.id).forEach((c) => (c.selected = newVisible));
  }

  private getGroupDimensions(context: TimeSeriesContext): string[] {
    return this.item.inheritGlobalGrouping ? context.getGroupDimensions() : this.item.grouping;
  }

  private fetchData(context: TimeSeriesContext) {
    const request: FetchBucketsRequest = {
      start: context.getSelectedTimeRange().from,
      end: context.getSelectedTimeRange().to,
      groupDimensions: this.getGroupDimensions(context),
      oqlFilter: FilterUtils.filtersToOQL(this.getFilterItems(context), 'attributes'),
      numberOfBuckets: 1,
      percentiles: [80, 90, 99],
    };
    return this._timeSeriesService
      .getTimeSeries(request)
      .pipe(map((response) => this.processResponse(response, context)));
  }

  private fetchBaseData(): Observable<ProcessedBucket[]> {
    const context = this.context;
    return this.fetchData(context).pipe(
      tap((response) => {
        this.baseBuckets = response;
        this.updateTableData();
      }),
    );
  }

  updateCompareData(response: TimeSeriesAPIResponse, compareContext: TimeSeriesContext) {
    this.tableIsLoading = false;
    // const baseData = this.processResponse(this.baseResponse!, this.executionContext);
    // const compareData = this.processResponse(response, compareContext);
    // const mergedData = this.mergeBaseAndCompareData(baseData, compareData);
    // this.updateDataSourceAndKeywords(mergedData);
  }

  private getFilterItems(context: TimeSeriesContext): FilterBarItem[] {
    const metricItem = {
      attributeName: 'metricType',
      type: FilterBarItemType.FREE_TEXT,
      exactMatch: true,
      freeTextValues: [`"${this.item.metricKey}"`],
      searchEntities: [],
    };
    let filterItems = [];
    if (this.item.inheritGlobalFilters) {
      filterItems = FilterUtils.combineGlobalWithChartFilters(
        context.getFilteringSettings().filterItems,
        this.item.filters,
      );
    } else {
      filterItems = this.item.filters.map(FilterUtils.convertApiFilterItem);
    }

    filterItems.push(metricItem);
    return filterItems;
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
    const entries: TableEntry[] = allSeriesIds.map((keyword) => {
      const baseBucket: ProcessedBucket = baseBucketsByIds[keyword];
      const compareBucket: ProcessedBucket = compareBucketsByIds[keyword];
      const hasOnlyCompareData = !!compareBucket && !baseBucket;
      const labelItems = this.getGroupDimensions(hasOnlyCompareData ? this.compareContext! : this.context).map(
        (a) => (baseBucket || compareBucket).attributes[a],
      );
      return {
        name: keyword,
        base: baseBucket,
        compare: compareBucket,
        groupingLabels: labelItems,
        // can use the same sync group because it is shared
        isSelected: this.context
          .getSyncGroup(this.item.id)
          .seriesShouldBeVisible(baseBucket?.seriesKey || compareBucket?.seriesKey),
        color: baseBucketsByIds[keyword]?.color || compareBucketsByIds[keyword]?.color,
        countDiff: this.percentageBetween(baseBucket?.count, compareBucket?.count),
        sumDiff: this.percentageBetween(baseBucket?.sum, compareBucket?.sum),
        avgDiff: this.percentageBetween(baseBucket?.avg, compareBucket?.avg),
        minDiff: this.percentageBetween(baseBucket?.min, compareBucket?.min),
        maxDiff: this.percentageBetween(baseBucket?.max, compareBucket?.max),
        pcl80Diff: this.percentageBetween(baseBucket?.pclValues?.[80], compareBucket?.pclValues?.[80]),
        pcl90Diff: this.percentageBetween(baseBucket?.pclValues?.[90], compareBucket?.pclValues?.[90]),
        pcl99Diff: this.percentageBetween(baseBucket?.pclValues?.[99], compareBucket?.pclValues?.[99]),
        tpsDiff: this.percentageBetween(baseBucket?.tps, compareBucket?.tps),
        tphDiff: this.percentageBetween(baseBucket?.tph, compareBucket?.tph),
      };
    });
    return entries;
  }

  private updateTableData() {
    const tableEntries = this.mergeBaseAndCompareData();
    this.fetchLegendEntities(tableEntries).subscribe();
    this.tableData$.next(tableEntries);
    this.tableIsLoading = false;
  }

  private processResponse(response: TimeSeriesAPIResponse, context: TimeSeriesContext): ProcessedBucket[] {
    const syncGroup = context.getSyncGroup(this.item.id);
    return response.matrix.map((series, i) => {
      if (series.length != 1) {
        // we should have just one bucket
        throw new Error('Something went wrong');
      }
      const seriesAttributes = response.matrixKeys[i];
      const responseBucket = series[0];
      responseBucket.attributes = seriesAttributes;
      const groupingLabels = this.getGroupDimensions(context).map((field) => seriesAttributes[field]);
      const seriesKey = this.mergeLabelItems(groupingLabels);
      return {
        ...responseBucket,
        seriesKey: seriesKey,
        color: context.getColor(seriesKey),
        avg: Math.trunc(responseBucket.sum / responseBucket.count),
        tps: Math.trunc(responseBucket.count / ((response.end! - response.start!) / 1000)),
        tph: Math.trunc((responseBucket.count / ((response.end! - response.start!) / 1000)) * 3600),
        selected: syncGroup.seriesShouldBeVisible(seriesKey),
      } as ProcessedBucket;
    });
  }

  onAllSeriesCheckboxClick(checked: boolean) {
    this.context.getSyncGroup(this.item.id).setAllSeriesChecked(checked);

    this.tableData$.getValue().forEach((entry) => {
      entry.isSelected = checked;
    });
  }

  onKeywordToggle(entry: TableEntry, selected: boolean) {
    let syncGroup = this.context.getSyncGroup(this.item.id);
    if (selected) {
      syncGroup.showSeries(entry.name);
    } else {
      this.allSeriesChecked = false;
      syncGroup.hideSeries(entry.name);
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

  hideSeries(key: string): void {}

  showSeries(key: string): void {}

  private fetchLegendEntities(data: TableEntry[]): Observable<any> {
    const groupDimensions = this.getGroupDimensions(this.context);
    const requests$ = groupDimensions
      .map((attributeKey, i) => {
        const attribute = this.attributesByIds[attributeKey];
        const entityName = attribute?.metadata['entity'];
        if (!entityName) {
          return undefined;
        }
        const entityIds = new Set<string>(data.map((entry) => entry.groupingLabels[i]).filter((v) => !!v));
        return this._timeSeriesUtilityService.getEntitiesNamesByIds(Array.from(entityIds.values()), entityName).pipe(
          tap((response) => {
            data.forEach((entry, j) => {
              const labelId = entry.groupingLabels[i];
              if (labelId) {
                if (response[labelId]) {
                  entry.groupingLabels[i] = response[labelId];
                } else {
                  entry.groupingLabels[i] = labelId + ' (unresolved)';
                }
                data[j] = { ...entry };
              }
            });
          }),
        );
      })
      .filter((x) => !!x);
    return forkJoin(requests$);
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
      .addSortNumberPredicate('AVG', (item) => item.base?.attributes['avg'])
      .addSortNumberPredicate('AVG_comp', (item) => item.compare?.attributes['avg'])
      .addSortNumberPredicate('AVG_diff', (item) => item.avgDiff)
      .addSortNumberPredicate('MIN', (item) => item.base?.min)
      .addSortNumberPredicate('MIN_comp', (item) => item.compare?.min)
      .addSortNumberPredicate('MIN_diff', (item) => item.minDiff)
      .addSortNumberPredicate('MAX', (item) => item.base?.max)
      .addSortNumberPredicate('MAX_comp', (item) => item.compare?.max)
      .addSortNumberPredicate('MAX_diff', (item) => item.maxDiff)
      .addSortNumberPredicate('PCL_80', (item) => item.base?.pclValues?.[80])
      .addSortNumberPredicate('PCL_80_comp', (item) => item.compare?.pclValues?.[80])
      .addSortNumberPredicate('PCL_80_diff', (item) => item.pcl80Diff)
      .addSortNumberPredicate('PCL_90', (item) => item.base?.pclValues?.[90])
      .addSortNumberPredicate('PCL_90_comp', (item) => item.compare?.pclValues?.[90])
      .addSortNumberPredicate('PCL_90_diff', (item) => item.pcl90Diff)
      .addSortNumberPredicate('PCL_99', (item) => item.base?.pclValues?.[99])
      .addSortNumberPredicate('PCL_99_comp', (item) => item.compare?.pclValues?.[99])
      .addSortNumberPredicate('PCL_99_diff', (item) => item.pcl99Diff)
      .addSortNumberPredicate('TPS', (item) => item.base?.tps)
      .addSortNumberPredicate('TPS_comp', (item) => item.compare?.tps)
      .addSortNumberPredicate('TPS_diff', (item) => item.tpsDiff)
      .addSortNumberPredicate('TPH', (item) => item.base?.tph)
      .addSortNumberPredicate('TPH_comp', (item) => item.compare?.tph)
      .addSortNumberPredicate('TPH_diff', (item) => item.tphDiff)
      .build();
  }

  percentageBetween(x: number | undefined, y: number | undefined) {
    if (x && y) {
      return ((y - x) / x) * 100;
    } else {
      return undefined;
    }
  }

  getType(): 'TABLE' | 'CHART' {
    return 'TABLE';
  }
}

interface TableColumn {
  id: string;
  // type: TableColumnType;
  label: string;
  subLabel?: string;
  mapValue: (bucket: BucketResponse) => any;
  mapDiffValue: (entry: TableEntry) => number | undefined;
  isVisible: boolean;
}

const ColumnsValueFunctions = {
  [TableColumnType.COUNT]: (b: ProcessedBucket) => b?.count,
  [TableColumnType.SUM]: (b: ProcessedBucket) => b?.sum,
  [TableColumnType.AVG]: (b: ProcessedBucket) => b?.avg,
  [TableColumnType.MIN]: (b: ProcessedBucket) => b?.min,
  [TableColumnType.MAX]: (b: ProcessedBucket) => b?.max,
  [TableColumnType.PCL_80]: (b: ProcessedBucket) => b?.pclValues?.[80],
  [TableColumnType.PCL_90]: (b: ProcessedBucket) => b?.pclValues?.[90],
  [TableColumnType.PCL_99]: (b: ProcessedBucket) => b?.pclValues?.[99],
  [TableColumnType.TPS]: (b: ProcessedBucket) => b?.tps,
  [TableColumnType.TPH]: (b: ProcessedBucket) => b?.tph,
};

const ColumnsDiffFunctions: Record<TableColumnType, (entry: TableEntry) => number | undefined> = {
  [TableColumnType.COUNT]: (entry: TableEntry) => entry.countDiff,
  [TableColumnType.SUM]: (entry: TableEntry) => entry.sumDiff,
  [TableColumnType.AVG]: (entry: TableEntry) => entry.avgDiff,
  [TableColumnType.MIN]: (entry: TableEntry) => entry.minDiff,
  [TableColumnType.MAX]: (entry: TableEntry) => entry.maxDiff,
  [TableColumnType.PCL_80]: (entry: TableEntry) => entry.pcl80Diff,
  [TableColumnType.PCL_90]: (entry: TableEntry) => entry.pcl90Diff,
  [TableColumnType.PCL_99]: (entry: TableEntry) => entry.pcl99Diff,
  [TableColumnType.TPS]: (entry: TableEntry) => entry.tpsDiff,
  [TableColumnType.TPH]: (entry: TableEntry) => entry.tphDiff,
};

const ColumnsLabels = {
  [TableColumnType.COUNT]: 'Count',
  [TableColumnType.SUM]: 'Sum',
  [TableColumnType.AVG]: 'Avg',
  [TableColumnType.MIN]: 'Min',
  [TableColumnType.MAX]: 'Max',
  [TableColumnType.PCL_80]: 'Pcl. 80 (ms)',
  [TableColumnType.PCL_90]: 'Pcl. 90 (ms)',
  [TableColumnType.PCL_99]: 'Pcl. 99 (ms)',
  [TableColumnType.TPS]: 'Tps',
  [TableColumnType.TPH]: 'Tph',
};
