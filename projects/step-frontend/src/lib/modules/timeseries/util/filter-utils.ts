import { TsFilterItem } from '../performance-view/filter-bar/model/ts-filter-item';
import { ChartFilterItem } from '@exense/step-core';

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
   * Method to convert API filters to a valid OQL
   */
  static combineGlobalWithChartFilters(globalFilters: TsFilterItem[], items: ChartFilterItem[]): string {
    if (!items || items.length === 0) {
      return '';
    }
    return '';
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

  private convertApiFilterItem(item: ChartFilterItem): TsFilterItem {
    const baseObject: TsFilterItem = {
      label: item.label,
      attributeName: item.attribute,
      exactMatch: item.exactMatch,
      min: item.min,
      max: item.max,
      type: item.type,
      searchEntities: [],
      textValues: [],
      freeTextValues: [],
    };
    switch (item.type) {
      case 'OPTIONS':
        break;
      case 'FREE_TEXT':
        break;
      case 'EXECUTION':
      case 'TASK':
      case 'PLAN':
        break;
      case 'NUMERIC':
      case 'DATE':
        break;
    }

    return baseObject;
  }
}
