import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Bucket } from '../../bucket';
import { TimeSeriesService } from '../../time-series.service';
import { FindBucketsRequest } from '../../find-buckets-request';
import { TimeseriesColorsPool } from '../../util/timeseries-colors-pool';
import { TimeSeriesChartResponse } from '../../time-series-chart-response';
import { TimeSeriesKeywordsContext } from '../time-series-keywords.context';
import { ExecutionsPageService } from '../../executions-page.service';
import { ExecutionTabContext } from '../execution-tab-context';
import { BucketFilters } from '../../model/bucket-filters';

@Component({
  selector: 'step-execution-filters',
  templateUrl: './execution-filters.component.html',
  styleUrls: ['./execution-filters.component.scss'],
})
export class ExecutionFiltersComponent implements OnInit {
  attributesPair: { key?: string; value?: string }[] = [{}, {}, {}, {}];

  @Input('executionId') executionId!: string;

  private executionContext!: ExecutionTabContext;

  constructor(private executionPageService: ExecutionsPageService) {}

  ngOnInit(): void {
    this.executionContext = this.executionPageService.getContext(this.executionId);
  }

  applyParams() {
    const filters: BucketFilters = {};
    this.attributesPair.forEach((pair) => {
      if (pair.key && pair.value) {
        filters[pair.key] = pair.value;
      }
    });
    this.executionContext.updateFilters(filters);
  }
}
