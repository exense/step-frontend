import { Injectable } from '@angular/core';
import { SelectionCollector } from './selection-collector';
import { SelectionCollectorImpl } from './selection-collector-impl';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../../shared';
import { AutoDeselectStrategy } from '../../shared/auto-deselect-strategy.enum';
import { RegistrationStrategy } from '../../shared/registration.strategy';

@Injectable({
  providedIn: 'root',
})
export class SelectionCollectorFactoryService {
  create<KEY, ENTITY>(
    selectionKeyProperty: string,
    autoDeselectStrategy: AutoDeselectStrategy = AutoDeselectStrategy.KEEP_SELECTION,
    registrationStrategy: RegistrationStrategy = RegistrationStrategy.AUTO
  ): SelectionCollector<KEY, ENTITY> {
    const selectionCollector = new SelectionCollectorImpl<KEY, ENTITY>();
    selectionCollector.setup(selectionKeyProperty, autoDeselectStrategy, registrationStrategy);
    return selectionCollector;
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .constant('AutoDeselectStrategy', AutoDeselectStrategy)
  .service('selectionCollectorFactoryService', downgradeInjectable(SelectionCollectorFactoryService));
