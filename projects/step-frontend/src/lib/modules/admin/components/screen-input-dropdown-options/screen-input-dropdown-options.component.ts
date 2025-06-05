import { Component, Input, ViewChild } from '@angular/core';
import { Input as SInput } from '@exense/step-core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { EXPRESSION_SCRIPT_FORMATTER } from '../../types/model-formatters';

@Component({
  selector: 'step-screen-input-dropdown-options',
  templateUrl: './screen-input-dropdown-options.component.html',
  styleUrls: ['./screen-input-dropdown-options.component.scss'],
  standalone: false,
})
export class ScreenInputDropdownOptionsComponent {
  readonly activationExpressionFormatter = EXPRESSION_SCRIPT_FORMATTER;

  @ViewChild('panel')
  private panel!: MatExpansionPanel;

  @Input() model!: SInput;

  addOption($event: Event): void {
    $event.preventDefault();
    $event.stopPropagation();
    if (this.panel.closed) {
      this.panel.open();
    }
    if (!this.model.options) {
      this.model.options = [];
    }
    this.model.options!.push({
      value: '',
      activationExpression: { script: '' },
    });
  }

  moveOption(value: string, offset: number): void {
    const options = this.model.options!;
    const position = options.findIndex((option) => option.value === value);
    const newPosition = position + offset;
    if (newPosition >= 0 && newPosition < options.length) {
      const item = options[position];
      options.splice(position, 1);
      options.splice(newPosition, 0, item);
    }
  }

  removeOption(value: string): void {
    this.model.options = this.model.options!.filter((option) => option.value !== value);
  }
}
