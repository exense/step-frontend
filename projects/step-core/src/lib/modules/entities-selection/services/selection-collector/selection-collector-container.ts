import { SelectionCollector } from './selection-collector';

export abstract class SelectionCollectorContainer<KEY, ENTITY> {
  abstract selectionCollector: SelectionCollector<KEY, ENTITY>;
}
