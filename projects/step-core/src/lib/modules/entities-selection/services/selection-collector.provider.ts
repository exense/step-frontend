import { inject, Provider } from '@angular/core';
import { SelectionCollector } from './selection-collector/selection-collector';
import { AutoDeselectStrategy } from '../shared/auto-deselect-strategy.enum';
import { SelectionCollectorFactoryService } from './selection-collector/selection-collector-factory.service';
import { RegistrationStrategy } from '../shared/registration.strategy';

export interface SelectionCollectorProviderConfig {
  selectionKeyProperty: string;
  autoDeselectStrategy?: AutoDeselectStrategy;
  registrationStrategy?: RegistrationStrategy;
}

export const selectionCollectionProvider = <KEY, ENTITY>(
  selectionKeyPropertyOrConfig: string | SelectionCollectorProviderConfig,
  autoDeselectStrategy?: AutoDeselectStrategy
): Provider[] => [
  SelectionCollectorFactoryService,
  {
    provide: SelectionCollector,
    useFactory: () => {
      const f = inject(SelectionCollectorFactoryService);
      if (typeof selectionKeyPropertyOrConfig === 'string') {
        const selectionKeyProperty = selectionKeyPropertyOrConfig;
        return f.create<KEY, ENTITY>(selectionKeyProperty, autoDeselectStrategy);
      }
      const conf = selectionKeyPropertyOrConfig;
      return f.create<KEY, ENTITY>(conf.selectionKeyProperty, conf.autoDeselectStrategy, conf.registrationStrategy);
    },
  },
];
