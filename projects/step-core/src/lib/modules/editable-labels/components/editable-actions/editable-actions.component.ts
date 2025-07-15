import { Component, EventEmitter, Output } from '@angular/core';
import { EDITABLE_LABELS_COMMON_IMPORTS } from '../../types/editable-labels-common-imports.constant';

@Component({
  selector: 'step-editable-actions',
  templateUrl: './editable-actions.component.html',
  styleUrls: ['./editable-actions.component.scss'],
  imports: [...EDITABLE_LABELS_COMMON_IMPORTS],
})
export class EditableActionsComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() apply = new EventEmitter<void>();
}
