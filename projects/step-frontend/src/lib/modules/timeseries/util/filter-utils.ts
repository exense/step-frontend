import { FilterBarItemType, TsFilterItem } from '../performance-view/filter-bar/model/ts-filter-item';

export class FilterUtils {
  static filterItemIsValid(item: TsFilterItem) {
    return (
      item.freeTextValues?.length ||
      item.textValues?.some((v) => v.isSelected) ||
      item.min != undefined ||
      item.max != undefined
    );
  }

  static objectToOQL(object: { [key: string]: string }, attributesPrefix?: string) {
    if (!object || Object.keys(object).length === 0) {
      return undefined;
    }
    let clause = Object.keys(object)
      .map((key) => {
        const attribute = attributesPrefix ? `${attributesPrefix}.${key}` : key;
        return `${attribute} = ${object[key]}`;
      })
      .join(' and ');
    return `(${clause})`;
  }

  static filtersToOQL(items: TsFilterItem[], attributesPrefix?: string): string {
    if (!items || items.length === 0) {
      return '';
    }
    let andFilters: (string | undefined)[] = items.map((item) => {
      let clause;
      const attributeName = attributesPrefix ? `${attributesPrefix}.${item.attributeName}` : item.attributeName;
      switch (item.type) {
        case FilterBarItemType.OPTIONS:
          clause = item.textValues
            ?.filter((f) => f.isSelected)
            .map((f) => {
              const attribute = attributesPrefix ? `${attributesPrefix}.${item.attributeName}` : item.attributeName;
              return `${attribute} = ${f.value}`;
            })
            .join(' or ');
          break;
        case FilterBarItemType.FREE_TEXT:
          clause = item.freeTextValues?.map((value) => `${attributeName} ~ ".*${value}.*"`).join(' or ');
          break;
        case FilterBarItemType.NUMERIC:
        case FilterBarItemType.DATE:
          let clauses = [];
          if (item.min != null) {
            clauses.push(`${attributeName} >= ${item.min}`);
          }
          if (item.max != null) {
            clauses.push(`${attributeName} < ${item.max}`);
          }
          clause = '(' + clauses.join(' and ') + ')';
          break;
      }
      return clause ? `(${clause})` : undefined;
    });

    return andFilters.filter((f) => f).join(' and ');
  }
}
