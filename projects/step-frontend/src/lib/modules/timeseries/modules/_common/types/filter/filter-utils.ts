import { FilterBarItem, FilterBarItemType } from './filter-bar-item';
import { MetricAttribute, TimeSeriesFilterItem } from '@exense/step-core';
import { DashboardUrlParams, UrlFilterAttribute } from '../../injectables/dashboard-url-params.service';

export class FilterUtils {
  static filterItemIsValid(item: FilterBarItem): boolean {
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
    attributeProcessFn?: (x: string) => string,
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
  static combineGlobalWithChartFilters(
    globalFilters: FilterBarItem[],
    localFilters: TimeSeriesFilterItem[],
  ): FilterBarItem[] {
    const convertedItems: FilterBarItem[] = localFilters.map((item) => this.convertApiFilterItem(item));
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
    items?: FilterBarItem[],
    attributesPrefix?: string,
    attributeProcessFn?: (attribute: string) => string,
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
        case FilterBarItemType.OPTIONS:
          clause = item.textValues
            ?.filter((f) => f.isSelected)
            .map((f) => {
              return `${finalAttributeName} = ${f.value}`;
            })
            .join(' or ');
          break;
        case FilterBarItemType.FREE_TEXT:
          clause = item.freeTextValues
            ?.map((value) => {
              let regexMatch = `${finalAttributeName} ~ ".*${value}.*"`;
              const equalityMatch = `${finalAttributeName} = ${value}`;
              return item.exactMatch ? equalityMatch : regexMatch; // we need exact match for indexes efficiency
            })
            .join(' or ');
          break;
        case FilterBarItemType.EXECUTION:
        case FilterBarItemType.PLAN:
        case FilterBarItemType.TASK:
          clause = item.searchEntities
            ?.map((value) => {
              return `${finalAttributeName} = ${value.searchValue}`; // we need exact match for indexes efficiency
            })
            .join(' or ');
          break;
        case FilterBarItemType.NUMERIC:
        case FilterBarItemType.DATE:
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

  static convertToApiFilterItem(item: FilterBarItem): TimeSeriesFilterItem {
    let textValues: string[] = [];
    switch (item.type) {
      case FilterBarItemType.OPTIONS:
        textValues = item.textValues?.filter((i) => i.isSelected).map((item) => item.value) || [];
        break;
      case FilterBarItemType.FREE_TEXT:
        textValues = item.freeTextValues || [];
        break;
      case FilterBarItemType.EXECUTION:
      case FilterBarItemType.TASK:
      case FilterBarItemType.PLAN:
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

  static convertApiFilterItem(item: TimeSeriesFilterItem): FilterBarItem {
    const mappedItem: FilterBarItem = {
      label: item.label,
      attributeName: item.attribute!,
      exactMatch: item.exactMatch!,
      min: item.min,
      max: item.max,
      type: item.type! as FilterBarItemType,
      searchEntities: [],
      textValues: [],
      isLocked: !!item.label, // if there is no label, we're dealing with a custom item
      freeTextValues: [],
      removable: item.removable,
    };
    switch (item.type) {
      case FilterBarItemType.OPTIONS:
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
      case FilterBarItemType.FREE_TEXT:
        mappedItem.freeTextValues = item.textValues;
        break;
      case FilterBarItemType.EXECUTION:
      case FilterBarItemType.TASK:
      case FilterBarItemType.PLAN:
        mappedItem.searchEntities = item.textValues?.map((v) => ({ searchValue: v, entity: undefined })) || [];
        break;
      case FilterBarItemType.NUMERIC:
      case FilterBarItemType.DATE:
        mappedItem.min = item.min;
        mappedItem.max = item.max;
        break;
    }

    return mappedItem;
  }

  static createFilterItemFromAttribute(attribute: MetricAttribute): FilterBarItem {
    const item: FilterBarItem = {
      attributeName: attribute.name,
      label: attribute.displayName,
      isLocked: true,
      removable: true,
      isHidden: false,
      textValues: [],
      searchEntities: [],
      type: this.mapAttributeTypeToFilterType(attribute.type),
    };
    const entity = attribute.metadata['entity'];
    switch (entity) {
      case 'execution':
        item.type = FilterBarItemType.EXECUTION;
        break;
      case 'plan':
        item.type = FilterBarItemType.PLAN;
        break;
      case 'task':
        item.type = FilterBarItemType.TASK;
        break;
      default:
        break;
    }
    const knownValues = attribute.metadata['knownValues'];
    if (knownValues && knownValues.length > 0) {
      item.type = FilterBarItemType.OPTIONS;
      item.textValues = knownValues.map((v: string) => ({ value: v, isSelected: false }));
    }
    return item;
  }

  private static mapAttributeTypeToFilterType(type: string): FilterBarItemType {
    switch (type) {
      case 'TEXT':
        return FilterBarItemType.FREE_TEXT;
      case 'NUMBER':
        return FilterBarItemType.NUMERIC;
      case 'DATE':
        return FilterBarItemType.DATE;
      default:
        throw new Error('Unrecognized type: ' + type);
    }
  }

  public static createEmptyFilterTextItem(attribute: string): FilterBarItem {
    const fieldType: FilterBarItemType = this.determineFilterFieldType(attribute);
    return {
      removable: true,
      label: this.getFilterFieldLabel(attribute),
      type: fieldType,
      attributeName: attribute,
      isLocked: false,
    } as FilterBarItem;
  }

  private static determineFilterFieldType(attribute: string): FilterBarItemType {
    switch (attribute) {
      case 'eId':
        return FilterBarItemType.EXECUTION;
      case 'taskId':
        return FilterBarItemType.TASK;
      case 'planId':
        return FilterBarItemType.PLAN;
      default:
        return FilterBarItemType.FREE_TEXT;
    }
  }

  public static convertUrlKnownFilters(
    filters: UrlFilterAttribute[],
    attributesDefinition: MetricAttribute[],
  ): FilterBarItem[] {
    const attributesById: Record<string, MetricAttribute> = {};
    attributesDefinition.forEach((a) => (attributesById[a.name] = a));
    return filters
      .filter((i) => !!attributesById[i.attribute])
      .map((urlFilter) => {
        const filterItem = FilterUtils.createFilterItemFromAttribute(attributesById[urlFilter.attribute]);
        switch (filterItem.type) {
          case FilterBarItemType.OPTIONS:
            urlFilter.values?.forEach((v) => {
              let foundOptions = filterItem.textValues?.find((textValue) => textValue.value === v);
              if (foundOptions) {
                foundOptions.isSelected = true;
              } else {
                filterItem.textValues?.push({ value: v, isSelected: true });
              }
            });
            filterItem.exactMatch = true;
            break;
          case FilterBarItemType.FREE_TEXT:
            filterItem.freeTextValues = urlFilter.values;
            break;
          case FilterBarItemType.EXECUTION:
          case FilterBarItemType.TASK:
          case FilterBarItemType.PLAN:
            filterItem.exactMatch = true;
            filterItem.searchEntities = urlFilter.values?.map((v) => ({ searchValue: v, entity: undefined })) || [];
            break;
          case FilterBarItemType.NUMERIC:
          case FilterBarItemType.DATE:
            filterItem.min = urlFilter.min;
            filterItem.max = urlFilter.max;
            break;
        }
        return filterItem;
      });
  }

  public static isEntityFilter(filterItem: FilterBarItem): boolean {
    return [FilterBarItemType.PLAN, FilterBarItemType.TASK, FilterBarItemType.EXECUTION].includes(filterItem.type);
  }

  private static getFilterFieldLabel(attribute: string): string {
    switch (attribute) {
      case 'eId':
        return 'Execution';
      case 'taskId':
        return 'Task';
      case 'plan':
        return 'Plan';
      default:
        return attribute;
    }
  }
}
