import { ArrayItemLabelValueExtractor } from '../../basics/step-basics.module';

export abstract class MultiLevelArrayItemLabelValueExtractor<
  T = unknown,
  V = unknown,
> extends ArrayItemLabelValueExtractor<T, V> {
  abstract getChildren(item?: T): T[];
}
