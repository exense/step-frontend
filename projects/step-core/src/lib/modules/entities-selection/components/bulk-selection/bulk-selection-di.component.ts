import { SelectionCollector } from '../../services/selection-collector/selection-collector';
import { Component, EventEmitter, inject, Input, Optional, Output } from '@angular/core';
import { BulkSelectionType } from '../../shared/bulk-selection-type.enum';

@Component({
  selector: 'step-bulk-selection-di',
  template: `<step-bulk-selection
    [selectionCollector]="_selectionCollector"
    [showLabel]="showLabel"
    [selectionType]="selectionType"
    (selectionTypeChange)="selectionTypeChange.emit($event)"
    [isDisabled]="isDisabled"
  >
  </step-bulk-selection>`,
  styleUrls: [],
})
export class BulkSelectionDiComponent<KEY, ENTITY> {
  _selectionCollector = inject<SelectionCollector<KEY, ENTITY>>(SelectionCollector, { optional: true })!;
  @Input() showLabel: boolean = true;
  @Input() isDisabled: boolean = false;
  @Input() selectionType: BulkSelectionType = BulkSelectionType.NONE;
  @Output() selectionTypeChange = new EventEmitter<BulkSelectionType>();
}
