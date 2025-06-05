import { Component, inject, ViewEncapsulation } from '@angular/core';
import { BaseEditorComponent } from '../base-editor/base-editor.component';
import { CRON_PRESETS } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-preset-editor',
  templateUrl: './preset-editor.component.html',
  styleUrls: ['./preset-editor.component.scss'],
  host: {
    class: 'editors-group',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class PresetEditorComponent extends BaseEditorComponent {
  protected readonly items = inject(CRON_PRESETS);

  protected selectedValue = this.items[0].key;

  handleValueChange(value: string): void {
    this.selectedValue = value;
    this.updateExpression();
  }

  protected getExpression(): string {
    return this.selectedValue;
  }
}
