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
   * While skipping, only the 'hidden' filters will be included in the request, together with the custom attributes.
   * Custom filters or oql will be not included. Used for thread group chart
   */
  private skipCustomFilters = false;

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

  withSkipCustomFilters(skip: boolean): FindBucketsRequestBuilder {
    this.skipCustomFilters = skip;
    return this;
  }

  getRange(): TSTimeRange | undefined {
    return this.range;
  }

  build(): FindBucketsRequest {
    if (!this.filteringSettings) {
      throw 'Filtering settings are mandatory';
    }
    let customAttributesOql = '';
    const hiddenFilters = this.filteringSettings.filterItems
      .filter(FilterUtils.filterItemIsValid)
      .filter((item) => item.isHidden);
    const customFilters = this.filteringSettings.filterItems
      .filter(FilterUtils.filterItemIsValid)
      .filter((item) => !item.isHidden);
    const filterItems = this.filteringSettings.filterItems.filter(
      (item) => FilterUtils.filterItemIsValid(item) && !(this.skipCustomFilters && !item.isHidden)
    );

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
        !this.skipCustomFilters
          ? isOqlMode
            ? this.filteringSettings.oql
            : FilterUtils.filtersToOQL(customFilters, this.attributesPrefix)
          : ''
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

  private combineOqlWithFilters(oql: string, filterItems: TsFilterItem[]): string {
    oql = oql.trim();
    const filtersOql = FilterUtils.filtersToOQL(filterItems, this.attributesPrefix);
    return [oql, filtersOql].filter((x) => x).join(' and ');
  }
}
