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
  private customFilters: TsFilterItem[] = [];
  private range?: TSTimeRange;
  private groupDimensions?: string[];
  private percentiles?: number[];
  private numberOfBuckets?: number;
  private filteringSettings?: TsFilteringSettings;

  /**
   * If present, only the that that are specified in the mask are preserved in the final filter. The other are removed.
   * If empty, the final filter.will remain unchanged.
   */
  private filterAttributesMask?: string[];

  private skipCustomOQL = false;

  constructor(builder?: FindBucketsRequestBuilder) {
    if (builder) {
      this.customFilters = JSON.parse(JSON.stringify(builder.customFilters));
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

  addAttribute(key: string, value: string): FindBucketsRequestBuilder {
    this.customAttributes[key] = value;
    return this;
  }

  withRange(range: TSTimeRange): FindBucketsRequestBuilder {
    this.range = range;
    return this;
  }

  withSkipCustomOQL(value: boolean): FindBucketsRequestBuilder {
    this.skipCustomOQL = value;
    return this;
  }

  withFilterAttributesMask(attributes: string[]): FindBucketsRequestBuilder {
    this.filterAttributesMask = attributes;
    return this;
  }

  getRange(): TSTimeRange | undefined {
    return this.range;
  }

  build(): FindBucketsRequest {
    if (!this.filteringSettings) {
      throw new Error('Filtering settings are mandatory');
    }
    let customAttributesOql = '';
    let filterItems = this.filteringSettings.filterItems;

    if (this.filterAttributesMask && this.filterAttributesMask.length > 0) {
      filterItems = filterItems.filter((item) => this.filterAttributesMask?.includes(item.attributeName));
    }
    const hiddenFilters = filterItems.filter(FilterUtils.filterItemIsValid).filter((item) => item.isHidden);
    const customFilters = filterItems.filter(FilterUtils.filterItemIsValid).filter((item) => !item.isHidden);
    console.log(hiddenFilters);
    if (Object.keys(this.customAttributes).length > 0) {
      customAttributesOql = FilterUtils.objectToOQL(this.customAttributes, this.attributesPrefix);
    }
    const isOqlMode = this.filteringSettings.mode === TsFilteringMode.OQL;

    // oql is skipped while custom filters have to be skipped
    const oql = new OQLBuilder()
      .open('and')
      .append(customAttributesOql)
      .append(FilterUtils.filtersToOQL(hiddenFilters, this.attributesPrefix)) // always include hidden filters
      .append(
        isOqlMode
          ? this.skipCustomOQL
            ? ''
            : this.filteringSettings.oql
          : FilterUtils.filtersToOQL(customFilters, this.attributesPrefix)
      )
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
