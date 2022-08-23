import { Component, Input } from '@angular/core';
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
}
