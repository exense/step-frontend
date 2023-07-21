import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  BucketAttributes,
  BucketResponse,
  TableComponent,
  TableDataSource,
  TableLocalDataSource,
  TableLocalDataSourceConfig,
  TimeSeriesAPIResponse,
} from '@exense/step-core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TimeSeriesKeywordsContext } from '../../pages/execution-page/time-series-keywords.context';
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
  readonly BASE_COLUMNS = ['name', 'count', 'sum', 'avg', 'min', 'max', 'pcl_80', 'pcl_90', 'pcl_99', 'tps', 'tph'];

  bucketsByKeywords: { [key: string]: BucketResponse } = {};
  tableIsLoading = true;
  dimensionKey = 'name';
  baseResponse: TimeSeriesAPIResponse | undefined; // in the context of compare mode, the main execution is the 'base' one
  compareResponse: TimeSeriesAPIResponse | undefined;
  groupDimensions: string[] = [];

  compareModeEnabled = false;

  // private keywordsService!: TimeSeriesKeywordsContext;
  @Input() executionContext!: TimeSeriesContext;

  private terminator$ = new Subject<void>();

  sortByNameAttributeFn = (a: BucketResponse, b: BucketResponse) =>
    a.attributes['name']?.toLowerCase() > b.attributes['name']?.toLowerCase() ? 1 : -1;

  ngOnInit(): void {
    if (!this.executionContext) {
      throw new Error('Execution context is mandatory');
    }
    this.tableDataSource = new TableLocalDataSource(this.tableData$, this.getDatasourceConfig());
    this.executionContext.keywordsContext.onKeywordToggled().subscribe((selection) => {
      this.bucketsByKeywords[selection.id].attributes!['isSelected'] = selection.isSelected;
    });
  }

  /**
   * This method is used to initialize and refresh the table.
   * @param response
   */
  updateData(response: TimeSeriesAPIResponse) {
    this.tableIsLoading = false;
    this.baseResponse = response;
    let baseData = this.processResponse(response, this.executionContext);
    let compareData: { keywords: string[]; buckets: Record<string, BucketResponse> } = { keywords: [], buckets: {} };
    this.tableData$.next(this.mergeBaseAndCompareData(baseData, compareData));
    this.executionContext.keywordsContext.setKeywords(baseData.keywords, true);
    this.tableIsLoading = false;
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
    let baseData = this.processResponse(this.baseResponse!, this.executionContext);
    let compareData = this.processResponse(response, compareContext);
    this.tableData$.next(this.mergeBaseAndCompareData(baseData, compareData));
  }

  disableCompareMode() {
    this.compareModeEnabled = false;
  }

  onKeywordToggle(keyword: string, event: any) {
    this.executionContext.keywordsContext.toggleKeyword(keyword);
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
}

interface ProcessedBuckets {
  keywords: string[];
  buckets: Record<string, BucketResponse>;
}
