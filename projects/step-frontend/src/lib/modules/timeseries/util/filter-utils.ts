import { TsFilterItem } from '../performance-view/filter-bar/model/ts-filter-item';
import { TimeSeriesFilterItem } from '@exense/step-core';
import { map } from 'rxjs';

export class FilterUtils {
  static filterItemIsValid(item: TsFilterItem): boolean {
    return (
      (item.freeTextValues && item.freeTextValues.length > 0) ||
      item.textValues?.some((v) => v.isSelected) ||
      item.min != undefined ||
      item.max != undefined ||
      item.searchEntities?.length > 0
    );
  }

  static objectToOQL(
    object: { [key: string]: string },
    attributesPrefix?: string,
    attributeProcessFn?: (x: string) => string
  ) {
    if (!object || Object.keys(object).length === 0) {
      return '';
    }
    let clause = Object.keys(object)
      .map((key) => {
        const processedAttribute = attributeProcessFn ? attributeProcessFn(key) : key;
        const attribute = attributesPrefix ? `${attributesPrefix}.${processedAttribute}` : processedAttribute;
        return `${attribute} = ${object[key]}`;
      })
      .join(' and ');
    return `(${clause})`;
  }

  /**
   * Method to convert API filters to a valid OQL. Local items take precedence.
   */
  static combineGlobalWithChartFilters(globalFilters: TsFilterItem[], items: TimeSeriesFilterItem[]): TsFilterItem[] {
    const convertedItems: TsFilterItem[] = items.map((item) => this.convertApiFilterItem(item));
    const localItemsIdsMap: Record<string, boolean> = {};
    convertedItems.forEach((item) => {
      localItemsIdsMap[item.attributeName!] = true;
    });
    globalFilters = globalFilters.filter((item) => !localItemsIdsMap[item.attributeName!]);

    return [...globalFilters, ...convertedItems];
  }

  /**
   * Method to convert FE filters to a valid OQL
   */
  static filtersToOQL(
    items: TsFilterItem[],
    attributesPrefix?: string,
    attributeProcessFn?: (attribute: string) => string
  ): string {
    if (!items || items.length === 0) {
      return '';
    }
    let andFilters: (string | undefined)[] = items.map((item) => {
      let clause;
      const processedAttribute = attributeProcessFn ? attributeProcessFn(item.attributeName) : item.attributeName;
      let finalAttributeName = attributesPrefix ? `${attributesPrefix}.${processedAttribute}` : processedAttribute;
      if (finalAttributeName.includes(' ')) {
        finalAttributeName = `"${finalAttributeName}"`;
      }
      switch (item.type) {
        case 'OPTIONS':
          clause = item.textValues
            ?.filter((f) => f.isSelected)
            .map((f) => {
              return `${finalAttributeName} = ${f.value}`;
            })
            .join(' or ');
          break;
        case 'FREE_TEXT':
          clause = item.freeTextValues
            ?.map((value) => {
              let regexMatch = `${finalAttributeName} ~ ".*${value}.*"`;
              const equalityMatch = `${finalAttributeName} = ${value}`;
              return item.exactMatch ? equalityMatch : regexMatch; // we need exact match for indexes efficiency
            })
            .join(' or ');
          break;
        case 'EXECUTION':
        case 'PLAN':
        case 'TASK':
          clause = item.searchEntities
            ?.map((value) => {
              return `${finalAttributeName} = ${value.searchValue}`; // we need exact match for indexes efficiency
            })
            .join(' or ');
          break;
        case 'NUMERIC':
        case 'DATE':
          let clauses = [];
          if (item.min != null) {
            clauses.push(`${finalAttributeName} >= ${item.min}`);
          }
          if (item.max != null) {
            clauses.push(`${finalAttributeName} < ${item.max}`);
          }
          clause = '(' + clauses.join(' and ') + ')';
          break;
        default:
          throw new Error('Filter type not handled: ' + item.type);
      }
      return clause ? `(${clause})` : undefined;
    });

    return andFilters.filter((f) => f).join(' and ');
  }

  static convertToApiFilterItem(item: TsFilterItem): TimeSeriesFilterItem {
    let textValues: string[] = [];
    switch (item.type) {
      case 'OPTIONS':
        textValues = item.textValues?.filter((i) => i.isSelected).map((item) => item.value) || [];
        break;
      case 'FREE_TEXT':
        textValues = item.freeTextValues || [];
        break;
      case 'EXECUTION':
      case 'TASK':
      case 'PLAN':
        textValues = item.searchEntities.map((e) => e.searchValue).filter((x) => !!x) || [];
        break;
    }
    return {
      type: item.type,
      attribute: item.attributeName,
      min: item.min,
      max: item.max,
      label: item.label,
      textValues: textValues,
      textOptions: item.textValues?.map((o) => o.value),
      exactMatch: !!item.exactMatch,
    };
  }

  static convertApiFilterItem(item: TimeSeriesFilterItem): TsFilterItem {
    const mappedItem: TsFilterItem = {
      label: item.label,
      attributeName: item.attribute!,
      exactMatch: item.exactMatch!,
      min: item.min,
      max: item.max,
      type: item.type!,
      searchEntities: [],
      textValues: [],
      freeTextValues: [],
      removable: item.removable,
    };
    switch (item.type) {
      case 'OPTIONS':
        const options = item.textOptions?.map((o) => ({ value: o, isSelected: false })) || [];
        item.textValues?.forEach((v) => {
          const foundOption = options.find((o) => o.value === v);
          if (foundOption) {
            foundOption.isSelected = true;
          } else {
            options.push({ isSelected: true, value: v });
          }
        });
        mappedItem.textValues = options;
        break;
      case 'FREE_TEXT':
        mappedItem.freeTextValues = item.textValues;
        break;
      case 'EXECUTION':
      case 'TASK':
      case 'PLAN':
        mappedItem.searchEntities = item.textValues?.map((v) => ({ searchValue: v, entity: undefined })) || [];
        break;
      case 'NUMERIC':
      case 'DATE':
        mappedItem.min = item.min;
        mappedItem.max = item.max;
        break;
    }

    return mappedItem;
  }
}
