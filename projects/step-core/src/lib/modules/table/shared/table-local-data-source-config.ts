export type SearchPredicate<T> = (item: T, searchValue: string) => boolean;
export type SortPredicate<T> = (itemA: T, itemB: T) => number;
export interface TableLocalDataSourceConfig<T> {
  searchPredicates?: { [columnName: string]: SearchPredicate<T> };
  sortPredicates?: { [columnName: string]: SortPredicate<T> };
}
