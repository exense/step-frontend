import { Component, inject, Input, ViewChild } from '@angular/core';
import { EXPRESSION_SCRIPT_FORMATTER } from '../../../basics/step-basics.module';
import { MatExpansionPanel } from '@angular/material/expansion';
import { OptionForm, OptionFormArray, optionFormCreate, optionFormId } from '../../types/column-editor-dialog.form';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'step-custom-column-editor-dropdown-options',
  templateUrl: './custom-column-editor-dropdown-options.component.html',
  styleUrl: './custom-column-editor-dropdown-options.component.scss',
})
export class CustomColumnEditorDropdownOptionsComponent {
  private _fb = inject(FormBuilder).nonNullable;

  readonly activationExpressionFormatter = EXPRESSION_SCRIPT_FORMATTER;
  readonly optionFormId = optionFormId;

  @ViewChild('panel', { static: true })
  private panel!: MatExpansionPanel;

  @Input({ required: true }) options!: OptionFormArray;

  addOption($event: Event): void {
    $event.preventDefault();
    $event.stopPropagation();
    if (this.panel.closed) {
      this.panel.open();
    }
    this.options.push(optionFormCreate(this._fb));
  }

  moveOption(optionForm: OptionForm, offset: number): void {
    const position = this.options.controls.indexOf(optionForm);
    const newPosition = position + offset;
    if (newPosition >= 0 && newPosition < this.options.length) {
      this.options.removeAt(position, { emitEvent: false });
      this.options.insert(newPosition, optionForm);
    }
  }

  removeOption(optionForm: OptionForm): void {
    const position = this.options.controls.indexOf(optionForm);
    this.options.removeAt(position);
  }
}
