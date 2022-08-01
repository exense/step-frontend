import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Bucket } from '../../bucket';
import { TimeSeriesService } from '../../time-series.service';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeseriesColorsPool } from '../../util/timeseries-colors-pool';
import { TimeSeriesChartResponse } from '../../time-series-chart-response';

@Component({
  selector: 'step-timeseries-table',
  templateUrl: './timeseries-table.component.html',
  styleUrls: ['./timeseries-table.component.scss'],
})
export class TimeseriesTableComponent implements OnInit {
  // TODO use a dynamic list for percentiles
  tableColumns = ['name', 'count', 'sum', 'avg', 'min', 'max', 'pcl_90', 'pcl_90', 'pcl_99', 'tps'];
  tableDataSource: Bucket[] = [];
  bucketsByKeywords: { [key: string]: Bucket } = {};
  tableIsLoading = true;
  dimensionKey = 'name';
  response: TimeSeriesChartResponse | undefined;

  @Input('colorsPool') colorsPool!: TimeseriesColorsPool;
  @Output('onKeywordsFetched') onKeywordsFetched = new EventEmitter<string[]>();

  sortByNameAttributeFn = (a: Bucket, b: Bucket) =>
    a.attributes.name.toLowerCase() > b.attributes.name.toLowerCase() ? 1 : -1;

  constructor(private timeSeriesService: TimeSeriesService) {}

  ngOnInit(): void {}

  // for live streaming
  accumulateData(request: FindBucketsRequest) {
    this.timeSeriesService
      .fetchBucketsNew({ ...request, groupDimensions: [this.dimensionKey], numberOfBuckets: 1 })
      .subscribe((response: TimeSeriesChartResponse) => {
        response.matrix.map((series, i) => {
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
            // TODO update distribution
          } else {
            this.bucketsByKeywords[keywordName] = bucket;
          }
        });
        this.tableDataSource = Object.values(this.bucketsByKeywords).sort(this.sortByNameAttributeFn);
      });
  }

  init(request: FindBucketsRequest) {
    this.timeSeriesService
      .fetchBucketsNew({
        ...request,
        groupDimensions: [this.dimensionKey],
        numberOfBuckets: 1,
        percentiles: [80, 90, 99],
      })
      .subscribe((response) => {
        this.response = response;
        let keywords: string[] = [];
        this.tableDataSource = response.matrix
          .map((series, i) => {
            if (series.length != 1) {
              // we should have just one bucket
              throw new Error('Something went wrong');
            }
            let attributes = response.matrixKeys[i];
            let bucket = series[0];
            bucket.attributes = attributes;
            let keywordName = attributes[this.dimensionKey];
            bucket.attributes.color = this.colorsPool.getColor(keywordName);
            bucket.attributes.avg = (bucket.sum / bucket.count).toFixed(0);
            // this.keywords[attributes[dimensionKey]] = { color: color, isSelected: true };
            keywords.push(keywordName);
            this.bucketsByKeywords[keywordName] = bucket;
            return bucket;
          })
          .sort(this.sortByNameAttributeFn);
        this.onKeywordsFetched.emit(keywords);
        this.tableIsLoading = false;
      });
  }

  get Math() {
    return Math;
  }
}
