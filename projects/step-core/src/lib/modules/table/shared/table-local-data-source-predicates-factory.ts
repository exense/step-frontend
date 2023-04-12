import { SearchPredicate, SortPredicate } from './table-local-data-source-config';

export class TableLocalDataSourcePredicatesFactory {
  createSearchStringPredicate<T>(getField: (item: T) => string | undefined): SearchPredicate<T> {
    return (item, searchValue) => {
      const value = (getField(item) || '').toLowerCase();
      return value.includes(searchValue.toLowerCase());
    };
  }

  createSearchNumberPredicate<T>(getField: (item: T) => number | undefined): SearchPredicate<T> {
    return (item, searchValue) => {
      const value = getField(item) || 0;
      return value === Number(searchValue);
    };
  }

  createSortNumberPredicate<T>(getField: (item: T) => number | undefined): SortPredicate<T> {
    return (itemA, itemB) => {
      const fieldA = getField(itemA) || 0;
      const fieldB = getField(itemB) || 0;
      return fieldA - fieldB;
    };
  }

  createSortStringPredicate<T>(getField: (item: T) => string | undefined): SortPredicate<T> {
    return (itemA, itemB) => {
      const fieldA = (getField(itemA) || '').toLowerCase();
      const fieldB = (getField(itemB) || '').toLowerCase();
      return fieldA.localeCompare(fieldB);
    };
  }

  createSortBooleanPredicate<T>(getField: (item: T) => boolean | undefined): SortPredicate<T> {
    return (itemA, itemB) => {
      const fieldA = getField(itemA) ?? false;
      const fieldB = getField(itemB) ?? false;
      return +fieldA - +fieldB;
    };
  }
}
