import { Component, inject, Input, Optional } from '@angular/core';
import { SelectionCollector } from '../../services/selection-collector/selection-collector';

@Component({
  selector: 'step-entity-selection-di',
  template: `<step-entity-selection
    [entity]="entity"
    [selectionCollector]="_selectionCollector"
  ></step-entity-selection>`,
  styleUrls: [],
  standalone: false,
})
export class EntitySelectionDiComponent<KEY, ENTITY> {
  _selectionCollector = inject<SelectionCollector<KEY, ENTITY>>(SelectionCollector, { optional: true }) || undefined;
  @Input() entity?: ENTITY;
}
