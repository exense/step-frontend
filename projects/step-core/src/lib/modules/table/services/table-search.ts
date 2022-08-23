export abstract class TableSearch {
  abstract onSearch(column: string, eventOrValue: Event | string, regex?: boolean): void;
}
