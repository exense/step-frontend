import { TableLocalDataSourcePredicatesFactory } from './table-local-data-source-predicates-factory';
import { SearchPredicate, SortPredicate, TableLocalDataSourceConfig } from './table-local-data-source-config';

export class TableLocalDataSourceConfigBuilder<T> {
  private predicatesFactory = new TableLocalDataSourcePredicatesFactory();

  private resultConfig: TableLocalDataSourceConfig<T> = {};

  addCustomSearchPredicate(propertyName: string, searchPredicate: SearchPredicate<T>): this {
    this.resultConfig.searchPredicates = this.resultConfig.searchPredicates || {};
    this.resultConfig.searchPredicates[propertyName] = searchPredicate;
    return this;
  }

  addCustomSortPredicate(propertyName: string, sortPredicate: SortPredicate<T>): this {
    this.resultConfig.sortPredicates = this.resultConfig.sortPredicates || {};
    this.resultConfig.sortPredicates[propertyName] = sortPredicate;
    return this;
  }

  addSearchStringPredicate(propertyName: string, getField: (item: T) => string | undefined): this {
    const predicate = this.predicatesFactory.createSearchStringPredicate(getField);
    return this.addCustomSearchPredicate(propertyName, predicate);
  }

  addSearchStringRegexPredicate(propertyName: string, getField: (item: T) => string | undefined): this {
    const predicate = this.predicatesFactory.createSearchStringRegexPredicate(getField);
    return this.addCustomSearchPredicate(propertyName, predicate);
  }

  addSearchNumberPredicate(propertyName: string, getField: (item: T) => number | undefined): this {
    const predicate = this.predicatesFactory.createSearchNumberPredicate(getField);
    return this.addCustomSearchPredicate(propertyName, predicate);
  }

  addSortNumberPredicate(propertyName: string, getField: (item: T) => number | undefined): this {
    const predicate = this.predicatesFactory.createSortNumberPredicate(getField);
    return this.addCustomSortPredicate(propertyName, predicate);
  }

  addSortStringPredicate(propertyName: string, getField: (item: T) => string | undefined): this {
    const predicate = this.predicatesFactory.createSortStringPredicate(getField);
    return this.addCustomSortPredicate(propertyName, predicate);
  }

  addSortBooleanPredicate(propertyName: string, getField: (item: T) => boolean | undefined): this {
    const predicate = this.predicatesFactory.createSortBooleanPredicate(getField);
    return this.addCustomSortPredicate(propertyName, predicate);
  }

  build(): TableLocalDataSourceConfig<T> {
    const result = this.resultConfig;
    this.resultConfig = {};
    return result;
  }
}
