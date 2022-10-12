import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Bucket } from '../../bucket';
import { TimeSeriesService } from '../../time-series.service';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeseriesColorsPool } from '../../util/timeseries-colors-pool';
import { TimeSeriesChartResponse } from '../../time-series-chart-response';
import { TimeSeriesKeywordsContext } from '../../execution-page/time-series-keywords.context';
import { TimeSeriesContextsFactory } from '../../time-series-contexts-factory.service';
import { BucketAttributes, TableDataSource, TableLocalDataSource, TableLocalDataSourceConfig } from '@exense/step-core';
import { ExecutionContext } from '../../execution-page/execution-context';
import { Subscription } from 'rxjs';

@Component({
  selector: 'step-timeseries-table',
  templateUrl: './timeseries-table.component.html',
  styleUrls: ['./timeseries-table.component.scss'],
})
export class TimeseriesTableComponent implements OnInit, OnDestroy {
  // TODO use a dynamic list for percentiles
  tableColumns = ['name', 'count', 'sum', 'avg', 'min', 'max', 'pcl_90', 'pcl_90', 'pcl_99', 'tps', 'tph'];
  tableDataSource: TableDataSource<Bucket> | undefined;
  bucketsByKeywords: { [key: string]: Bucket } = {};
  tableIsLoading = true;
  dimensionKey = 'name';
  response: TimeSeriesChartResponse | undefined;
  @Input() findRequest!: FindBucketsRequest;
  groupDimensions: string[] = [];

  private keywordsService!: TimeSeriesKeywordsContext;
  @Input() executionContext!: ExecutionContext;

  @Output() onInitializationComplete: EventEmitter<void> = new EventEmitter();

  subscriptions: Subscription = new Subscription();

  // @Output('onKeywordsFetched') onKeywordsFetched = new EventEmitter<string[]>();
  // @Output('onKeywordToggled') onKeywordToggled = new EventEmitter<string>();

  sortByNameAttributeFn = (a: Bucket, b: Bucket) =>
    a.attributes.name.toLowerCase() > b.attributes.name.toLowerCase() ? 1 : -1;

  constructor(private timeSeriesService: TimeSeriesService, private executionsPageService: TimeSeriesContextsFactory) {}

  ngOnInit(): void {
    if (!this.executionContext) {
      throw new Error('Execution context is mandatory');
    }
    if (!this.findRequest) {
      throw new Error('FindRequest input is mandatory');
    }
    this.keywordsService = this.executionContext.getKeywordsContext();
    this.subscriptions.add(
      this.keywordsService.onKeywordToggled().subscribe((selection) => {
        this.bucketsByKeywords[selection.id].attributes.isSelected = selection.isSelected;
      })
    );
    this.subscriptions.add(
      this.executionContext.onGroupingChange().subscribe((groupDimensions) => {
        this.groupDimensions = groupDimensions;
        if (!this.findRequest) {
          return;
        }
        this.fetchBuckets(true);
      })
    );
    this.fetchBuckets();
  }

  fetchBuckets(autoSelectAll = false) {
    this.getBuckets(this.findRequest, (keywords) => this.keywordsService.setKeywords(keywords, autoSelectAll));
  }

  onKeywordToggle(keyword: string, event: any) {
    this.keywordsService.toggleKeyword(keyword);
  }

  refresh(request: FindBucketsRequest) {
    this.findRequest = request;
    this.fetchBuckets();
  }

  private getBuckets(request: FindBucketsRequest, keywordsCallback: (series: string[]) => void) {
    let groupDimensions = this.executionContext.getGroupDimensions();
    this.timeSeriesService
      .fetchBuckets({
        ...request,
        groupDimensions: groupDimensions,
        numberOfBuckets: 1,
        percentiles: [80, 90, 99],
      })
      .subscribe((response) => {
        this.response = response;
        let keywords: string[] = [];
        this.tableDataSource = new TableLocalDataSource(
          response.matrix
            .map((series, i) => {
              if (series.length != 1) {
                // we should have just one bucket
                throw new Error('Something went wrong');
              }
              let seriesAttributes = response.matrixKeys[i];
              let bucket = series[0];
              bucket.attributes = seriesAttributes;
              let seriesKey = this.getSeriesKey(seriesAttributes, groupDimensions);
              bucket.attributes._id = seriesKey;
              bucket.attributes.color = this.keywordsService.getColor(seriesKey);
              bucket.attributes.avg = (bucket.sum / bucket.count).toFixed(0);
              bucket.attributes.tps = Math.trunc(bucket.count / ((response.end - response.start) / 1000));
              bucket.attributes.tph = Math.trunc((bucket.count / ((response.end - response.start) / 1000)) * 3600);
              let keywordSelection = this.keywordsService.getKeywordSelection(seriesKey);
              bucket.attributes.isSelected = keywordSelection ? keywordSelection.isSelected : true; // true because it has not been loaded yet
              // this.keywords[attributes[dimensionKey]] = { color: color, isSelected: true };
              keywords.push(seriesKey);
              this.bucketsByKeywords[seriesKey] = bucket;
              return bucket;
            })
            .sort(this.sortByNameAttributeFn),
          this.getDatasourceConfig()
        );
        keywordsCallback(keywords);
        this.tableIsLoading = false;
        this.onInitializationComplete.emit();
      });
  }

  getSeriesKey(attributes: BucketAttributes, groupDimensions: string[]) {
    return groupDimensions.map((field) => attributes[field]).join(' | ');
  }

  // for live streaming
  accumulateData(request: FindBucketsRequest) {
    this.timeSeriesService
      .fetchBuckets({ ...request, groupDimensions: [this.dimensionKey], numberOfBuckets: 1 })
      .subscribe((response: TimeSeriesChartResponse) => {
        response.matrix
          .map((series, i) => {
            if (series.length != 1) {
              // we should have just one bucket
              throw new Error('Something went wrong');
            }
            let bucket = series[0];
            let keywordName = response.matrixKeys[i][this.dimensionKey];
            let existingBucketForKeyword = this.bucketsByKeywords[keywordName];
            if (existingBucketForKeyword) {
              // we need to accumulate them
              existingBucketForKeyword.sum += bucket.sum;
              existingBucketForKeyword.count += bucket.count;
              existingBucketForKeyword.min = Math.min(existingBucketForKeyword.min, bucket.min);
              existingBucketForKeyword.max = Math.min(existingBucketForKeyword.max, bucket.max);
              // TODO update percentiles
            } else {
              this.bucketsByKeywords[keywordName] = bucket;
            }
            return existingBucketForKeyword;
          })
          .sort(this.sortByNameAttributeFn);
      });
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
      },
    };
  }

  get Math() {
    return Math;
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}
