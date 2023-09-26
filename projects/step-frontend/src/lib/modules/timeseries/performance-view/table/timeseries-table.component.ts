import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  BucketAttributes,
  BucketResponse,
  KeywordsService,
  TableComponent,
  TableDataSource,
  TableLocalDataSource,
  TableLocalDataSourceConfig,
  TimeSeriesAPIResponse,
} from '@exense/step-core';
import { BehaviorSubject, Subject } from 'rxjs';
import { KeywordSelection, TimeSeriesKeywordsContext } from '../../pages/execution-page/time-series-keywords.context';
import { TimeSeriesContext } from '../../time-series-context';

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
  selector: 'step-timeseries-table',
  templateUrl: './timeseries-table.component.html',
  styleUrls: ['./timeseries-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TimeseriesTableComponent implements OnInit, OnDestroy {
  tableData$ = new BehaviorSubject<TableEntry[]>([]);
  tableDataSource: TableDataSource<TableEntry> | undefined;
  private entriesByIds = new Map<string, TableEntry>();

  readonly BASE_COLUMNS = ['name', 'count', 'sum', 'avg', 'min', 'max', 'pcl_80', 'pcl_90', 'pcl_99', 'tps', 'tph'];
  readonly COMPARE_COLUMN_ID_SUFFIX = '_compare';
  readonly DIFF_COLUMN_ID_SUFFIX = '_diff';

  tableIsLoading = true;
  dimensionKey = 'name';
  baseResponse: TimeSeriesAPIResponse | undefined; // in the context of compare mode, the main execution is the 'base' one
  compareResponse: TimeSeriesAPIResponse | undefined;
  groupDimensions: string[] = [];

  allSeriesChecked: boolean = true;
  compareModeEnabled = false;
  compareContext: TimeSeriesContext | undefined;

  // private keywordsService!: TimeSeriesKeywordsContext;
  @Input() executionContext!: TimeSeriesContext;
  keywordsService!: TimeSeriesKeywordsContext;

  private terminator$ = new Subject<void>();
  columns: TableColumn[] = [];
  visibleColumnsIds: string[] = [];

  ngOnInit(): void {
    if (!this.executionContext) {
      throw new Error('Execution context is mandatory');
    }
    this.columns = this.getInitialColumns();
    this.prepareVisibleColumns();
    this.tableDataSource = new TableLocalDataSource(this.tableData$, this.getDatasourceConfig());
    this.keywordsService = this.executionContext.keywordsContext;
    const keywordsContext = this.executionContext.keywordsContext;
    keywordsContext.onKeywordToggled().subscribe((selection) => {
      // this.bucketsByKeywords[selection.id].attributes!['isSelected'] = selection.isSelected;
      const entries = this.tableData$.getValue();
      entries.forEach((entry) => {
        if (entry.name === selection.id) {
          entry.isSelected = selection.isSelected;
        }
      });
      if (!selection.isSelected) {
        this.allSeriesChecked = false;
      }
    });
    keywordsContext.onKeywordsUpdated().subscribe((keywords) => {
      Object.keys(keywords).forEach((keyword) => {
        const selection: KeywordSelection = keywords[keyword];
        const existingEntry = this.entriesByIds.get(selection.id);
        if (existingEntry) {
          existingEntry.isSelected = selection.isSelected;
        }
      });
    });
  }

  private getInitialColumns(): TableColumn[] {
    return [
      {
        id: 'count',
        type: TableColumnType.BASE,
        label: 'Count',
        isVisible: true,
        isCompareColumn: false,
        mapValue: (entry) => entry?.count,
        mapDiffValue: (entry) => entry.countDiff,
      },
      {
        id: 'sum',
        type: TableColumnType.BASE,
        label: 'Sum',
        isVisible: true,
        isCompareColumn: false,
        mapValue: (entry) => entry?.sum,
        mapDiffValue: (entry) => entry.countDiff,
      },
      {
        id: 'avg',
        type: TableColumnType.BASE,
        label: 'Avg',
        isVisible: true,
        isCompareColumn: false,
        mapValue: (entry) => entry?.attributes?.['avg'],
        mapDiffValue: (entry) => entry.countDiff,
      },
      {
        id: 'min',
        type: TableColumnType.BASE,
        label: 'Min',
        isVisible: true,
        isCompareColumn: false,
        mapValue: (entry) => entry?.min,
        mapDiffValue: (entry) => entry.countDiff,
      },
      {
        id: 'max',
        type: TableColumnType.BASE,
        label: 'Max',
        isVisible: true,
        isCompareColumn: false,
        mapValue: (entry) => entry?.max,
        mapDiffValue: (entry) => entry.countDiff,
      },
      {
        id: 'pcl_80',
        type: TableColumnType.BASE,
        label: 'Pcl. 80 (ms)',
        isVisible: true,
        isCompareColumn: false,
        mapValue: (entry) => entry?.pclValues?.[80],
        mapDiffValue: (entry) => entry.countDiff,
      },
      {
        id: 'pcl_90',
        type: TableColumnType.BASE,
        label: 'Pcl. 90 (ms)',
        isVisible: true,
        isCompareColumn: false,
        mapValue: (entry) => entry?.max,
        mapDiffValue: (entry) => entry.countDiff,
      },
      {
        id: 'pcl_99',
        type: TableColumnType.BASE,
        label: 'Pcl. 99 (ms)',
        isVisible: true,
        isCompareColumn: false,
        mapValue: (entry) => entry?.max,
        mapDiffValue: (entry) => entry.countDiff,
      },
      {
        id: 'tps',
        type: TableColumnType.BASE,
        label: 'Tps',
        isVisible: true,
        isCompareColumn: false,
        mapValue: (entry) => entry?.attributes?.['tps'],
        mapDiffValue: (entry) => entry.countDiff,
      },
      {
        id: 'tph',
        type: TableColumnType.BASE,
        label: 'Tph',
        isVisible: true,
        isCompareColumn: false,
        mapValue: (entry) => entry?.attributes?.['tps'],
        mapDiffValue: (entry) => entry.countDiff,
      },
    ];
  }

  /**
   * This method is used to initialize and refresh the table.
   * @param response
   */
  updateData(response: TimeSeriesAPIResponse) {
    this.tableIsLoading = false;
    this.baseResponse = response;
    let baseData = this.processResponse(response, this.executionContext);
    const compareData = this.compareModeEnabled
      ? this.processResponse(this.compareResponse!, this.compareContext!)
      : undefined;
    const mergedData = this.mergeBaseAndCompareData(baseData, compareData);
    this.updateDataSourceAndKeywords(mergedData);
    this.tableIsLoading = false;
  }

  prepareVisibleColumns() {
    const visibleColumns = ['name'];
    this.columns.forEach((c) => {
      if (!c.isVisible) {
        return;
      } else {
        visibleColumns.push(c.id);
        if (this.compareModeEnabled) {
          visibleColumns.push(c.id + this.COMPARE_COLUMN_ID_SUFFIX);
          visibleColumns.push(c.id + this.DIFF_COLUMN_ID_SUFFIX);
        }
      }
    });
    this.visibleColumnsIds = visibleColumns;
  }

  updateCompareData(response: TimeSeriesAPIResponse, compareContext: TimeSeriesContext) {
    this.tableIsLoading = false;
    this.compareResponse = response;
    const baseData = this.processResponse(this.baseResponse!, this.executionContext);
    const compareData = this.processResponse(response, compareContext);
    const mergedData = this.mergeBaseAndCompareData(baseData, compareData);
    this.updateDataSourceAndKeywords(mergedData);
  }

  private mergeBaseAndCompareData(baseBuckets: ProcessedBuckets, compareBuckets?: ProcessedBuckets): TableEntry[] {
    let allKeywords: string[] = [
      ...new Set([...baseBuckets.keywords, ...(compareBuckets ? compareBuckets.keywords : [])]),
    ];
    allKeywords = allKeywords.sort();
    const entries: TableEntry[] = allKeywords.map((keyword) => {
      let base = baseBuckets.buckets[keyword];
      let compare = compareBuckets?.buckets[keyword];
      return {
        name: keyword,
        base: baseBuckets.buckets[keyword],
        compare: compare,
        color: baseBuckets.buckets[keyword]?.attributes['color'] || compare?.attributes['color'],
        countDiff: this.percentageBetween(base?.count, compare?.count),
        sumDiff: this.percentageBetween(base?.sum, compare?.sum),
        avgDiff: this.percentageBetween(base?.attributes['avg'], compare?.attributes['avg']),
        minDiff: this.percentageBetween(base?.min, compare?.min),
        maxDiff: this.percentageBetween(base?.max, compare?.max),
        pcl80Diff: this.percentageBetween(base?.pclValues?.[80], compare?.pclValues?.[80]),
        pcl90Diff: this.percentageBetween(base?.pclValues?.[90], compare?.pclValues?.[90]),
        pcl99Diff: this.percentageBetween(base?.pclValues?.[99], compare?.pclValues?.[99]),
        tpsDiff: this.percentageBetween(base?.attributes['tps'], compare?.attributes['tps']),
        tphDiff: this.percentageBetween(base?.attributes['tph'], compare?.attributes['tph']),
      };
    });
    return entries;
  }

  private processResponse(response: TimeSeriesAPIResponse, context: TimeSeriesContext): ProcessedBuckets {
    const keywords: string[] = [];
    const bucketsByIds: Record<string, BucketResponse> = {};
    response.matrix.forEach((series, i) => {
      if (series.length != 1) {
        // we should have just one bucket
        throw new Error('Something went wrong');
      }
      const seriesAttributes = response.matrixKeys[i];
      const bucket = series[0];
      bucket.attributes = seriesAttributes;
      const seriesKey = this.getSeriesKey(seriesAttributes, context.getGroupDimensions());
      bucket.attributes['_id'] = seriesKey;
      bucket.attributes['color'] = context.keywordsContext.getColor(seriesKey);
      bucket.attributes['avg'] = (bucket.sum / bucket.count).toFixed(0);
      bucket.attributes['tps'] = Math.trunc(bucket.count / ((response.end! - response.start!) / 1000));
      bucket.attributes['tph'] = Math.trunc((bucket.count / ((response.end! - response.start!) / 1000)) * 3600);
      const keywordSelection = context.keywordsContext.getKeywordSelection(seriesKey);
      bucket.attributes['isSelected'] = keywordSelection ? keywordSelection.isSelected : true; // true because it has not been loaded yet
      keywords.push(seriesKey);
      bucketsByIds[seriesKey] = bucket;
    });
    return { keywords, buckets: bucketsByIds };
  }

  enableCompareMode(response: TimeSeriesAPIResponse, compareContext: TimeSeriesContext) {
    this.compareModeEnabled = true;
    this.compareContext = compareContext;
    this.compareResponse = response;
    this.prepareVisibleColumns();
    const baseData = this.processResponse(this.baseResponse!, this.executionContext);
    const compareData = this.processResponse(response, compareContext);
    const mergedData = this.mergeBaseAndCompareData(baseData, compareData);
    this.updateDataSourceAndKeywords(mergedData);
  }

  private updateDataSourceAndKeywords(data: TableEntry[], selectAllKeywords = false): void {
    const keywords: string[] = [];
    const entriesByIds = new Map<string, TableEntry>();
    data.forEach((entry) => {
      entriesByIds.set(entry.name, entry);
      keywords.push(entry.name);
    });
    this.entriesByIds = entriesByIds; // for caching purpose
    this.executionContext.keywordsContext.setKeywords(keywords, selectAllKeywords);
    this.tableData$.next(data);
  }

  disableCompareMode() {
    this.compareModeEnabled = false;
    this.compareContext = undefined;
    this.compareResponse = undefined;
  }

  onAllSeriesCheckboxClick(event: any) {
    this.keywordsService.toggleSelectAll();
  }

  onKeywordToggle(entry: TableEntry) {
    this.executionContext.keywordsContext.toggleKeyword(entry.name);
  }

  getSeriesKey(attributes: BucketAttributes, groupDimensions: string[]) {
    if (Object.keys(attributes).length === 0) {
      return '<empty>';
    }
    return groupDimensions
      .map((field) => attributes[field])
      .map((x) => (x ? x : '<empty>'))
      .join(' | ');
  }

  getDatasourceConfig(): TableLocalDataSourceConfig<TableEntry> {
    return TableLocalDataSource.configBuilder<TableEntry>()
      .addSortStringPredicate('name', (item) => item.base?.attributes['name'])
      .addSortNumberPredicate('count', (item) => item.base?.count)
      .addSortNumberPredicate('count_comp', (item) => item.compare?.count)
      .addSortNumberPredicate('count_diff', (item) => item.countDiff)
      .addSortNumberPredicate('sum', (item) => item.base?.sum)
      .addSortNumberPredicate('sum_comp', (item) => item.compare?.sum)
      .addSortNumberPredicate('sum_diff', (item) => item.sumDiff)
      .addSortNumberPredicate('avg', (item) => item.base?.attributes['avg'])
      .addSortNumberPredicate('avg_comp', (item) => item.compare?.attributes['avg'])
      .addSortNumberPredicate('avg_diff', (item) => item.avgDiff)
      .addSortNumberPredicate('min', (item) => item.base?.min)
      .addSortNumberPredicate('min_comp', (item) => item.compare?.min)
      .addSortNumberPredicate('min_diff', (item) => item.minDiff)
      .addSortNumberPredicate('max', (item) => item.base?.max)
      .addSortNumberPredicate('max_comp', (item) => item.compare?.max)
      .addSortNumberPredicate('max_diff', (item) => item.maxDiff)
      .addSortNumberPredicate('pcl_80', (item) => item.base?.pclValues?.[80])
      .addSortNumberPredicate('pcl_80_comp', (item) => item.compare?.pclValues?.[80])
      .addSortNumberPredicate('pcl_80_diff', (item) => item.pcl80Diff)
      .addSortNumberPredicate('pcl_90', (item) => item.base?.pclValues?.[90])
      .addSortNumberPredicate('pcl_90_comp', (item) => item.compare?.pclValues?.[90])
      .addSortNumberPredicate('pcl_90_diff', (item) => item.pcl90Diff)
      .addSortNumberPredicate('pcl_99', (item) => item.base?.pclValues?.[99])
      .addSortNumberPredicate('pcl_99_comp', (item) => item.compare?.pclValues?.[99])
      .addSortNumberPredicate('pcl_99_diff', (item) => item.pcl99Diff)
      .addSortNumberPredicate('tps', (item) => item.base?.attributes['tps'])
      .addSortNumberPredicate('tps_comp', (item) => item.compare?.attributes['tps'])
      .addSortNumberPredicate('tps_diff', (item) => item.tpsDiff)
      .addSortNumberPredicate('tph', (item) => item.base?.attributes['tph'])
      .addSortNumberPredicate('tph_comp', (item) => item.compare?.attributes['tph'])
      .addSortNumberPredicate('tph_diff', (item) => item.tphDiff)
      .build();
  }

  get Math() {
    return Math;
  }

  percentageBetween(x: number | undefined, y: number | undefined) {
    if (x && y) {
      return ((y - x) / x) * 100;
    } else {
      return undefined;
    }
  }

  ngOnDestroy(): void {
    this.tableData$.complete();
    this.terminator$.next();
    this.terminator$.complete();
  }

  get TableColumnType() {
    return TableColumnType;
  }
}

interface ProcessedBuckets {
  keywords: string[];
  buckets: Record<string, BucketResponse>;
}

enum TableColumnType {
  BASE,
  COMPARE,
  DIFF,
}

interface TableColumn {
  id: string;
  type: TableColumnType;
  label: string;
  subLabel?: string;
  mapValue: (bucket: BucketResponse) => any;
  mapDiffValue: (entry: TableEntry) => number | undefined;
  isCompareColumn: boolean;
  isVisible: boolean;
}
