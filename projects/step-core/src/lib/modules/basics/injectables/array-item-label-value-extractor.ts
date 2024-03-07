export abstract class ArrayItemLabelValueExtractor<T = unknown, V = unknown> {
  abstract getLabel(item: T): string;
  abstract getValue(item: T): V;
}
