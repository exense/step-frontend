import { TsFilterItem } from '../performance-view/filter-bar/model/ts-filter-item';
import { TSTimeRange } from '../chart/model/ts-time-range';
import { FindBucketsRequest } from '../find-buckets-request';
import { OQLBuilder } from './oql-builder';
import { FilterUtils } from './filter-utils';
import { TsFilteringSettings } from '../model/ts-filtering-settings';
import { TsFilteringMode } from '../model/ts-filtering-mode';

export class FindBucketsRequestBuilder {
  readonly attributesPrefix = 'attributes';

  private customAttributes: { [key: string]: any } = {};
  private baseFilters: { [key: string]: any } = {};
  private customFilters: TsFilterItem[] = [];
  private range?: TSTimeRange;
  private groupDimensions?: string[];
  private percentiles?: number[];
  private numberOfBuckets?: number;
  private filteringSettings?: TsFilteringSettings;

  constructor(builder?: FindBucketsRequestBuilder) {
    if (builder) {
      this.customFilters = JSON.parse(JSON.stringify(builder.customFilters));
      this.baseFilters = JSON.parse(JSON.stringify(builder.baseFilters));
      this.range = JSON.parse(JSON.stringify(builder.range));
      this.groupDimensions = builder.groupDimensions ? JSON.parse(JSON.stringify(builder.groupDimensions)) : [];
      this.percentiles = builder.percentiles ? JSON.parse(JSON.stringify(builder.percentiles)) : [];
      this.numberOfBuckets = builder.numberOfBuckets;
      this.filteringSettings = builder.filteringSettings;
      this.customAttributes = builder.customAttributes;
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

  withFilteringSettings(settings: TsFilteringSettings): FindBucketsRequestBuilder {
    this.filteringSettings = settings;
    return this;
  }

  withBaseFilters(attributes: { [key: string]: string }): FindBucketsRequestBuilder {
    this.baseFilters = attributes;
    return this;
  }

  addAttribute(key: string, value: string): FindBucketsRequestBuilder {
    this.customAttributes[key] = value;
    return this;
  }

  // withCustomFilters(filters: TsFilterItem[]): FindBucketsRequestBuilder {
  //   this.customFilters = filters;
  //   return this;
  // }

  withRange(range: TSTimeRange): FindBucketsRequestBuilder {
    this.range = range;
    return this;
  }

  getRange(): TSTimeRange | undefined {
    return this.range;
  }

  build(): FindBucketsRequest {
    if (!this.filteringSettings) {
      throw 'Filtering settings are mandatory';
    }
    console.log(this);
    const oql =
      this.filteringSettings.mode === TsFilteringMode.OQL
        ? this.prepareOql(this.filteringSettings.oql)
        : new OQLBuilder()
            .open(' and ')
            .append(FilterUtils.objectToOQL(this.filteringSettings.baseFilters))
            .append(FilterUtils.objectToOQL(this.customAttributes, this.attributesPrefix))
            .append(FilterUtils.filtersToOQL(this.filteringSettings.filterItems, this.attributesPrefix))
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

  private prepareOql(oql: string): string {
    if (Object.keys(this.customAttributes)) {
      return `(${oql}) and ${FilterUtils.objectToOQL(this.customAttributes, this.attributesPrefix)}`;
    } else {
      return oql;
    }
  }
}
