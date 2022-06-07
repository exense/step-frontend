export abstract class TableSearch {
  abstract onSearch(column: string, value: string, regex?: boolean): void;
}
