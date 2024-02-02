import { Injectable, OnDestroy } from '@angular/core';
import { SelectionCollector } from './selection-collector';
import { SelectionCollectorImpl } from './selection-collector-impl';
import { AutoDeselectStrategy } from '../../shared/auto-deselect-strategy.enum';
import { RegistrationStrategy } from '../../shared/registration.strategy';

@Injectable()
export class SelectionCollectorFactoryService implements OnDestroy {
  private instances: SelectionCollectorImpl<any, any>[] = [];

  create<KEY, ENTITY>(
    selectionKeyProperty: string,
    autoDeselectStrategy: AutoDeselectStrategy = AutoDeselectStrategy.KEEP_SELECTION,
    registrationStrategy: RegistrationStrategy = RegistrationStrategy.AUTO
  ): SelectionCollector<KEY, ENTITY> {
    const selectionCollector = new SelectionCollectorImpl<KEY, ENTITY>();
    selectionCollector.setup(selectionKeyProperty, autoDeselectStrategy, registrationStrategy);
    this.instances.push(selectionCollector);
    return selectionCollector;
  }
  ngOnDestroy(): void {
    this.instances.forEach((collector) => collector.ngOnDestroy());
    this.instances.length = 0;
  }
}
