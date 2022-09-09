import { Component, Input, Optional } from '@angular/core';
import { SelectionCollector } from '../../services/selection-collector/selection-collector';

@Component({
  selector: 'step-entity-selection-di',
  template: `<step-entity-selection
    [entity]="entity"
    [selectionCollector]="_selectionCollector"
  ></step-entity-selection>`,
  styleUrls: [],
})
export class EntitySelectionDiComponent<KEY, ENTITY> {
  @Input() entity?: ENTITY;
  constructor(@Optional() public _selectionCollector?: SelectionCollector<KEY, ENTITY>) {}
}
