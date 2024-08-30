import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { of } from 'rxjs';
import { SelectionCollector } from '../../services/selection-collector/selection-collector';
import { BulkSelectionType } from '../../shared/bulk-selection-type.enum';
import { HasFilter } from '../../services/has-filter';

@Component({
  selector: 'step-bulk-selection-label',
  templateUrl: './bulk-selection-label.component.html',
  styleUrls: ['./bulk-selection-label.component.scss'],
})
export class BulkSelectionLabelComponent<KEY, ENTITY> {
  readonly hasFilter$ = inject(HasFilter, { optional: true })?.hasFilter$ ?? of(false);

  readonly BulkSelectionType = BulkSelectionType;
  @Input() selectionCollector?: SelectionCollector<KEY, ENTITY>;
  @Input() selectionType?: BulkSelectionType;
  @Output() selectionTypeChange = new EventEmitter<BulkSelectionType>();
  @Input() isDisabled = false;

  clearSelection(): void {
    if (this.isDisabled) {
      return;
    }
    this.selectionTypeChange.emit(BulkSelectionType.NONE);
  }

  selectAll(): void {
    if (this.isDisabled) {
      return;
    }
    this.selectionTypeChange.emit(BulkSelectionType.ALL);
  }

  selectFiltered(): void {
    if (this.isDisabled) {
      return;
    }
    this.selectionTypeChange.emit(BulkSelectionType.FILTERED);
  }
}
