import { Injectable } from '@angular/core';
import { SelectionCollector } from './selection-collector';
import { SelectionCollectorImpl } from './selection-collector-impl';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../../shared';

@Injectable({
  providedIn: 'root',
})
export class SelectionCollectorFactoryService {
  create<KEY, ENTITY>(selectionKeyProperty: string): SelectionCollector<KEY, ENTITY> {
    return new SelectionCollectorImpl(selectionKeyProperty);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .service('selectionCollectorFactoryService', downgradeInjectable(SelectionCollectorFactoryService));
