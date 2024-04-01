import { Component, EventEmitter, inject, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import {
  COMMON_IMPORTS,
  FilterBarItem,
  FilterBarItemType,
  FilterUtils,
  TimeSeriesContext,
} from '../../modules/_common';
import { ChartSkeletonComponent } from '../../modules/chart';
import {
  BucketAttributes,
  BucketResponse,
  FetchBucketsRequest,
  MarkerType,
  TableDataSource,
  TableLocalDataSource,
  TableLocalDataSourceConfig,
  TableSettings,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { TsComparePercentagePipe } from '../../modules/legacy/pipes/ts-compare-percentage.pipe';
import { TableColumnType } from '../../modules/_common/types/table-column-type';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ChartDashlet } from '../../modules/_common/types/chart-dashlet';

interface TableEntry {
  name: string;
  base?: BucketResponse;
  compare?: BucketResponse;
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

@Component({
  selector: 'step-table-dashlet',
  templateUrl: './table-dashlet.component.html',
  styleUrls: ['./table-dashlet.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [COMMON_IMPORTS, ChartSkeletonComponent, TsComparePercentagePipe],
})
export class TableDashletComponent implements ChartDashlet, OnInit {
  @Input() settings!: TableSettings;
  @Input() context!: TimeSeriesContext;
  @Input() editMode = false;

  @Output() remove = new EventEmitter();
  @Output() shiftLeft = new EventEmitter();
  @Output() shiftRight = new EventEmitter();

  private _timeSeriesService = inject(TimeSeriesService);

  tableData$ = new BehaviorSubject<TableEntry[]>([]);
  tableDataSource: TableDataSource<TableEntry> | undefined;
  tableIsLoading = true;

  columnsDefinition: TableColumn[] = [];
  visibleColumnsIds: string[] = ['name'];

  allSeriesChecked: boolean = true;

  readonly MarkerType = MarkerType;
  readonly TableColumnType = TableColumnType;

  ngOnInit(): void {
    if (!this.settings) {
      throw new Error('Settings input cannot be undefined');
    }
    this.columnsDefinition = this.settings.columns!.map((column) => {
      return {
        id: column.column!,
        label: ColumnsLabels[column.column],
        isVisible: column.selected,
        isCompareColumn: false,
        mapValue: ColumnsValueFunctions[column.column!],
      };
    });
    this.collectVisibleColumns();
    this.tableDataSource = new TableLocalDataSource(this.tableData$, this.getDatasourceConfig());
    this.fetchDataAndCreateTable().subscribe();
  }

  collectVisibleColumns(): void {
    let visibleColumns = this.columnsDefinition.filter((col) => col.isVisible).map((col) => col.id);
    this.visibleColumnsIds = ['name', ...visibleColumns];
  }

  onColumnVisibilityChange(column: TableColumn): void {
    // update the chart settings
    this.settings.columns.filter((c) => c.column === column.id).forEach((c) => (c.selected = !column.isVisible));
    console.log(this.settings);
  }

  private fetchDataAndCreateTable(): Observable<TimeSeriesAPIResponse> {
    const groupDimensions = this.context.getGroupDimensions();
    const request: FetchBucketsRequest = {
      start: this.context.getSelectedTimeRange().from,
      end: this.context.getSelectedTimeRange().to,
      groupDimensions: groupDimensions,
      oqlFilter: FilterUtils.filtersToOQL(this.getFilterItems(), 'attributes'),
      numberOfBuckets: 1,
      percentiles: [80, 90, 99],
    };
    return this._timeSeriesService.getTimeSeries(request).pipe(
      tap((response) => {
        this.createTable(response);
      }),
    );
  }

  private getFilterItems(): FilterBarItem[] {
    const metricItem = {
      attributeName: 'metricType',
      type: FilterBarItemType.FREE_TEXT,
      exactMatch: true,
      freeTextValues: [`"${this.settings.metricKey}"`],
      searchEntities: [],
    };
    return [metricItem, ...this.context.getFilteringSettings().filterItems];
  }

  refresh(blur?: boolean): Observable<any> {
    throw new Error('Method not implemented.');
  }

  private createTable(response: TimeSeriesAPIResponse) {
    const keywords: string[] = [];
    const bucketsByIds: Record<string, BucketResponse> = {};
    const data: TableEntry[] = [];
    response.matrix.forEach((series, i) => {
      if (series.length != 1) {
        // we should have just one bucket
        throw new Error('Something went wrong');
      }
      const seriesAttributes = response.matrixKeys[i];
      const bucket = series[0];
      bucket.attributes = seriesAttributes;
      const seriesKey = this.getSeriesKey(seriesAttributes);
      bucket.attributes['_id'] = seriesKey;
      bucket.attributes['avg'] = (bucket.sum / bucket.count).toFixed(0);
      bucket.attributes['tps'] = Math.trunc(bucket.count / ((response.end! - response.start!) / 1000));
      bucket.attributes['tph'] = Math.trunc((bucket.count / ((response.end! - response.start!) / 1000)) * 3600);
      // const keywordSelection = context.keywordsContext.getKeywordSelection(seriesKey);
      // bucket.attributes['isSelected'] = keywordSelection ? keywordSelection.isSelected : true; // true because it has not been loaded yet
      keywords.push(seriesKey);
      bucketsByIds[seriesKey] = bucket;
      data.push({
        name: seriesKey,
        base: series[0],
        color: this.context.getColor(seriesKey),
        isSelected: true,
      });
    });
    this.tableData$.next(data);
    this.tableIsLoading = false;
  }

  onAllSeriesCheckboxClick() {}

  onKeywordToggle(entry: TableEntry) {}

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
      .addSortNumberPredicate('TPS', (item) => item.base?.attributes['tps'])
      .addSortNumberPredicate('TPS_comp', (item) => item.compare?.attributes['tps'])
      .addSortNumberPredicate('TPS_diff', (item) => item.tpsDiff)
      .addSortNumberPredicate('TPH', (item) => item.base?.attributes['tph'])
      .addSortNumberPredicate('TPH_comp', (item) => item.compare?.attributes['tph'])
      .addSortNumberPredicate('TPH_diff', (item) => item.tphDiff)
      .build();
  }

  private getSeriesKey(attributes: BucketAttributes) {
    if (Object.keys(attributes).length === 0) {
      return '<empty>';
    }
    return this.context
      .getGroupDimensions()
      .map((field) => attributes[field])
      .map((x) => (x ? x : '<empty>'))
      .join(' | ');
  }
}

interface TableColumn {
  id: string;
  // type: TableColumnType;
  label: string;
  subLabel?: string;
  mapValue: (bucket: BucketResponse) => any;
  // mapDiffValue: (entry: TableEntry) => number | undefined;
  isCompareColumn: boolean;
  isVisible: boolean;
}

const ColumnsValueFunctions = {
  [TableColumnType.COUNT]: (b: BucketResponse) => b?.count,
  [TableColumnType.SUM]: (b: BucketResponse) => b?.sum,
  [TableColumnType.AVG]: (b: BucketResponse) => b?.attributes?.['avg'],
  [TableColumnType.MIN]: (b: BucketResponse) => b?.min,
  [TableColumnType.MAX]: (b: BucketResponse) => b?.max,
  [TableColumnType.PCL_80]: (b: BucketResponse) => b?.pclValues?.[80],
  [TableColumnType.PCL_90]: (b: BucketResponse) => b?.pclValues?.[90],
  [TableColumnType.PCL_99]: (b: BucketResponse) => b?.pclValues?.[99],
  [TableColumnType.TPS]: (b: BucketResponse) => b?.attributes?.['tps'],
  [TableColumnType.TPH]: (b: BucketResponse) => b?.attributes?.['tph'],
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
