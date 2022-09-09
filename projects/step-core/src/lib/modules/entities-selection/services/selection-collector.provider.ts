import { FactoryProvider } from '@angular/core';
import { SelectionCollector } from './selection-collector/selection-collector';
import { AutoDeselectStrategy } from '../shared/auto-deselect-strategy.enum';
import { SelectionCollectorFactoryService } from './selection-collector/selection-collector-factory.service';

export const selectionCollectionProvider = <KEY, ENTITY>(
  selectionKeyProperty: string,
  autoDeselectStrategy: AutoDeselectStrategy
): FactoryProvider => ({
  provide: SelectionCollector,
  useFactory: (f: SelectionCollectorFactoryService) =>
    f.create<KEY, ENTITY>(selectionKeyProperty, autoDeselectStrategy),
  deps: [SelectionCollectorFactoryService],
});
