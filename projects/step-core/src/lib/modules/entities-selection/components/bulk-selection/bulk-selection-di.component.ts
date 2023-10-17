import { SelectionCollector } from '../../services/selection-collector/selection-collector';
import { Component, EventEmitter, Input, Optional, Output } from '@angular/core';
import { BulkSelectionType } from '../../shared/bulk-selection-type.enum';

@Component({
  selector: 'step-bulk-selection-di',
  template: `<step-bulk-selection
    [selectionCollector]="_selectionCollector"
    [showLabel]="showLabel"
    [selectionType]="selectionType"
    (selectionTypeChange)="selectionTypeChange.emit($event)"
  >
  </step-bulk-selection>`,
  styleUrls: [],
})
export class BulkSelectionDiComponent<KEY, ENTITY> {
  @Input() showLabel: boolean = true;
  @Input() selectionType: BulkSelectionType = BulkSelectionType.NONE;
  @Output() selectionTypeChange = new EventEmitter<BulkSelectionType>();
  constructor(@Optional() public _selectionCollector?: SelectionCollector<KEY, ENTITY>) {}
}
