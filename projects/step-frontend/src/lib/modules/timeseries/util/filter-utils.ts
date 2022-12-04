import { FilterBarItemType, TsFilterItem } from '../performance-view/filter-bar/model/ts-filter-item';

export class FilterUtils {
  static filterItemIsValid(item: TsFilterItem) {
    return item.textValue || item.textValues?.some((v) => v.isSelected) || item.min || item.max;
  }

  static objectToOQL(object: { [key: string]: string }) {
    if (!object || Object.keys(object).length === 0) {
      return undefined;
    }
    let clause = Object.keys(object)
      .map((key) => {})
      .join(' and ');
    return `(${clause})`;
  }

  static filtersToOQL(items: TsFilterItem[]) {
    if (!items || items.length === 0) {
      return undefined;
    }
    let andFilters: (string | undefined)[] = items.map((item) => {
      let clause;
      switch (item.type) {
        case FilterBarItemType.TEXT:
          clause = item.textValues
            ?.filter((f) => f.isSelected)
            .map((f) => `attributes.${item.attributeName} = ${f.value}`)
            .join(' or ');
          break;
        case FilterBarItemType.FREE_TEXT:
          clause = `attributes.${item.attributeName} ~ ^.*${item.textValue}.*$`; // TODO make attributes customizable if needed in other places
          break;
        case FilterBarItemType.NUMERIC:
          break;
        case FilterBarItemType.DATE:
          break;
      }
      return clause ? `(${clause})` : undefined;
    });

    return andFilters.filter((f) => f).join(' and ');
  }
}
