import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BucketAttributes, TableDataSource, TableLocalDataSource, TableLocalDataSourceConfig } from '@exense/step-core';
import { Subject } from 'rxjs';
import { Bucket } from '../../bucket';
import { TimeSeriesKeywordsContext } from '../../execution-page/time-series-keywords.context';
import { TimeSeriesChartResponse } from '../../time-series-chart-response';
import { TimeSeriesContext } from '../../time-series-context';

@Component({
  selector: 'step-timeseries-table',
  templateUrl: './timeseries-table.component.html',
  styleUrls: ['./timeseries-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TimeseriesTableComponent implements OnInit, OnDestroy {
  // TODO use a dynamic list for percentiles
  tableColumns = ['name', 'count', 'sum', 'avg', 'min', 'max', 'pcl_90', 'pcl_90', 'pcl_99', 'tps', 'tph'];
  tableData$ = new Subject<Bucket[]>();
  tableDataSource: TableDataSource<Bucket> | undefined;

  bucketsByKeywords: { [key: string]: Bucket } = {};
  tableIsLoading = true;
  dimensionKey = 'name';
  response: TimeSeriesChartResponse | undefined;
  groupDimensions: string[] = [];

  private keywordsService!: TimeSeriesKeywordsContext;
  @Input() executionContext!: TimeSeriesContext;

  private terminator$ = new Subject<void>();

  sortByNameAttributeFn = (a: Bucket, b: Bucket) =>
    a.attributes.name?.toLowerCase() > b.attributes.name?.toLowerCase() ? 1 : -1;

  constructor() {}

  ngOnInit(): void {
    if (!this.executionContext) {
      throw new Error('Execution context is mandatory');
    }
    this.tableDataSource = new TableLocalDataSource(this.tableData$, this.getDatasourceConfig());
    this.keywordsService = this.executionContext.keywordsContext;
    this.keywordsService.onKeywordToggled().subscribe((selection) => {
      this.bucketsByKeywords[selection.id].attributes.isSelected = selection.isSelected;
    });
  }

  updateData(response: TimeSeriesChartResponse) {
    this.tableIsLoading = false;
    this.response = response;
    let keywords: string[] = [];
    let tableBuckets = response.matrix
      .map((series, i) => {
        if (series.length != 1) {
          // we should have just one bucket
          throw new Error('Something went wrong');
        }
        let seriesAttributes = response.matrixKeys[i];
        let bucket = series[0];
        bucket.attributes = seriesAttributes;
        let seriesKey = this.getSeriesKey(seriesAttributes, this.executionContext.getGroupDimensions());
        bucket.attributes._id = seriesKey || '<empty>';
        bucket.attributes.color = this.keywordsService.getColor(seriesKey);
        bucket.attributes.avg = (bucket.sum / bucket.count).toFixed(0);
        bucket.attributes.tps = Math.trunc(bucket.count / ((response.end - response.start) / 1000));
        bucket.attributes.tph = Math.trunc((bucket.count / ((response.end - response.start) / 1000)) * 3600);
        let keywordSelection = this.keywordsService.getKeywordSelection(seriesKey);
        bucket.attributes.isSelected = keywordSelection ? keywordSelection.isSelected : true; // true because it has not been loaded yet
        keywords.push(seriesKey);
        this.bucketsByKeywords[seriesKey] = bucket;
        return bucket;
      })
      .sort(this.sortByNameAttributeFn);
    this.tableData$.next(tableBuckets);
    this.keywordsService.setKeywords(keywords, true);
    this.tableIsLoading = false;
  }

  onKeywordToggle(keyword: string, event: any) {
    this.keywordsService.toggleKeyword(keyword);
  }

  getSeriesKey(attributes: BucketAttributes, groupDimensions: string[]) {
    return groupDimensions
      .map((field) => attributes[field])
      .map((x) => (x ? x : '<empty>'))
      .join(' | ');
  }

  getDatasourceConfig(): TableLocalDataSourceConfig<Bucket> {
    return {
      sortPredicates: {
        name: (b1: Bucket, b2: Bucket) => b1.attributes!['name'].localeCompare(b2.attributes!['name']),
        count: (b1: Bucket, b2: Bucket) => b1.count - b2.count,
        sum: (b1: Bucket, b2: Bucket) => b1.sum - b2.sum,
        avg: (b1: Bucket, b2: Bucket) => b1.attributes.avg - b2.attributes.avg,
        min: (b1: Bucket, b2: Bucket) => b1.min - b2.min,
        max: (b1: Bucket, b2: Bucket) => b1.max - b2.max,
        pcl_80: (b1: Bucket, b2: Bucket) => b1.pclValues[80] - b2.pclValues[80],
        pcl_90: (b1: Bucket, b2: Bucket) => b1.pclValues[90] - b2.pclValues[90],
        pcl_99: (b1: Bucket, b2: Bucket) => b1.pclValues[99] - b2.pclValues[99],
        tps: (b1: Bucket, b2: Bucket) => b1.attributes.tps - b2.attributes.tps,
        tph: (b1: Bucket, b2: Bucket) => b1.attributes.tph - b2.attributes.tph,
      },
    };
  }

  get Math() {
    return Math;
  }

  ngOnDestroy(): void {
    this.tableData$.complete();
    this.terminator$.next();
    this.terminator$.complete();
  }
}
