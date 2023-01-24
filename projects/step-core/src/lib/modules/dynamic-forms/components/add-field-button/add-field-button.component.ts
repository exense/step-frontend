import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'step-add-field-button',
  templateUrl: './add-field-button.component.html',
  styleUrls: ['./add-field-button.component.scss'],
})
export class AddFieldButtonComponent {
  @Input() possibleFields: string[] = [];
  @Output() addField = new EventEmitter<string | undefined>();
}
