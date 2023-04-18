export interface ArrayItemLabelValueExtractor<T = unknown, V = unknown> {
  getLabel(item: T): string;
  getValue(item: T): V;
}
