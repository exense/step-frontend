import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectionCollector } from '../../services/selection-collector/selection-collector';
import { BulkSelectionType } from '../../shared/bulk-selection-type.enum';

@Component({
  selector: 'step-bulk-selection-label',
  templateUrl: './bulk-selection-label.component.html',
  styleUrls: ['./bulk-selection-label.component.scss'],
})
export class BulkSelectionLabelComponent<KEY, ENTITY> {
  readonly BulkSelectionType = BulkSelectionType;
  @Input() selectionCollector?: SelectionCollector<KEY, ENTITY>;
  @Input() selectionType?: BulkSelectionType;
  @Output() selectionTypeChange = new EventEmitter<BulkSelectionType>();

  clearSelection(): void {
    this.selectionTypeChange.emit(BulkSelectionType.None);
  }

  selectAll(): void {
    this.selectionTypeChange.emit(BulkSelectionType.All);
  }

  selectFiltered(): void {
    this.selectionTypeChange.emit(BulkSelectionType.Filtered);
  }
}
