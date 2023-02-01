import { TsFilterItem } from '../performance-view/filter-bar/model/ts-filter-item';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { FindBucketsRequest } from '../find-buckets-request';
import { OQLBuilder } from './oql-builder';
import { FilterUtils } from './filter-utils';
import { TimeSeriesConfig } from '../time-series.config';

export class FindBucketsRequestBuilder {
  readonly attributesPrefix = 'attributes';

  private baseFilters: { [key: string]: any } = {};
  private customFilters: TsFilterItem[] = [];
  private range?: TSTimeRange;
  private groupDimensions?: string[];
  private percentiles?: number[];
  private numberOfBuckets?: number;

  constructor(builder?: FindBucketsRequestBuilder) {
    if (builder) {
      this.customFilters = JSON.parse(JSON.stringify(builder.customFilters));
      this.baseFilters = JSON.parse(JSON.stringify(builder.baseFilters));
      this.range = JSON.parse(JSON.stringify(builder.range));
      this.groupDimensions = builder.groupDimensions ? JSON.parse(JSON.stringify(builder.groupDimensions)) : [];
      this.percentiles = builder.percentiles ? JSON.parse(JSON.stringify(builder.percentiles)) : [];
      this.numberOfBuckets = builder.numberOfBuckets;
    }
  }

  clone(): FindBucketsRequestBuilder {
    return new FindBucketsRequestBuilder(this);
  }

  withNumberOfBuckets(numberOfBuckets: number) {
    this.numberOfBuckets = numberOfBuckets;
    return this;
  }

  withPercentiles(percentiles: number[]) {
    this.percentiles = percentiles;
    return this;
  }

  withGroupDimensions(dimensions: string[]) {
    this.groupDimensions = dimensions;
    return this;
  }

  withBaseFilters(attributes: { [key: string]: string }): FindBucketsRequestBuilder {
    this.baseFilters = attributes;
    return this;
  }

  addAttribute(key: string, value: string): FindBucketsRequestBuilder {
    this.baseFilters[key] = value;
    return this;
  }

  withCustomFilters(filters: TsFilterItem[]): FindBucketsRequestBuilder {
    this.customFilters = filters;
    return this;
  }

  withRange(range: TSTimeRange): FindBucketsRequestBuilder {
    this.range = range;
    return this;
  }

  getRange(): TSTimeRange | undefined {
    return this.range;
  }

  build(): FindBucketsRequest {
    const oql = new OQLBuilder()
      .open(' and ')
      .append(FilterUtils.objectToOQL(this.baseFilters, this.attributesPrefix))
      .append(FilterUtils.filtersToOQL(this.customFilters, this.attributesPrefix))
      .build();
    return {
      start: this.range!.from,
      end: this.range!.to,
      oqlFilter: oql,
      percentiles: this.percentiles,
      groupDimensions: this.groupDimensions,
      numberOfBuckets: this.numberOfBuckets,
    };
  }
}
