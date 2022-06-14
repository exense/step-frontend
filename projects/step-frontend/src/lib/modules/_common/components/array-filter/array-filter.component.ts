import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'step-array-filter',
  templateUrl: './array-filter.component.html',
  styleUrls: ['./array-filter.component.scss'],
})
export class ArrayFilterComponent {
  @Output() selectedItemsChange = new EventEmitter<string>();

  @Input() items: string[] = [];

  handleChange(selection: MatSelectChange): void {
    const values = selection.value as string[];
    let value = '';
    if (values.length === 1) {
      value = values[0];
    } else if (values.length > 1) {
      value = values.join('|');
      value = `(${value})`;
    }
    this.selectedItemsChange.emit(value);
  }
}
