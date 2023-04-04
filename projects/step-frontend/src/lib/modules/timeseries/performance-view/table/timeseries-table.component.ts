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
    return groupDimensions.map((field) => attributes[field]).join(' | ');
  }

  getDatasourceConfig(): TableLocalDataSourceConfig<Bucket> {
    return TableLocalDataSource.configBuilder<Bucket>()
      .addSortStringPredicate('name', (item) => item.attributes!['name'])
      .addSortNumberPredicate('count', (item) => item.count)
      .addSortNumberPredicate('sum', (item) => item.sum)
      .addSortNumberPredicate('avg', (item) => item.attributes.avg)
      .addSortNumberPredicate('min', (item) => item.min)
      .addSortNumberPredicate('max', (item) => item.max)
      .addSortNumberPredicate('pcl_80', (item) => item.pclValues[80])
      .addSortNumberPredicate('pcl_90', (item) => item.pclValues[90])
      .addSortNumberPredicate('pcl_99', (item) => item.pclValues[99])
      .addSortNumberPredicate('tps', (item) => item.attributes.tps)
      .addSortNumberPredicate('tph', (item) => item.attributes.tph)
      .build();
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
