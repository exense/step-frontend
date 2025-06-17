export abstract class ItemWidthRegisterService<T> {
  abstract registerWidth(item: T, width: number): void;
}
