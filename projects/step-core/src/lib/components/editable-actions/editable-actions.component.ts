import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'step-editable-actions',
  templateUrl: './editable-actions.component.html',
  styleUrls: ['./editable-actions.component.scss'],
})
export class EditableActionsComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() apply = new EventEmitter<void>();
}
