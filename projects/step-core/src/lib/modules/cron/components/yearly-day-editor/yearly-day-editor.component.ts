import { Component, ViewEncapsulation } from '@angular/core';
import { MonthlyDayEditorComponent } from '../monthly-day-editor/monthly-day-editor.component';
import { MONTHS_DICTIONARY } from '../../types/months';

@Component({
  selector: 'step-yearly-day-editor',
  templateUrl: './yearly-day-editor.component.html',
  styleUrls: ['./yearly-day-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
})
export class YearlyDayEditorComponent extends MonthlyDayEditorComponent {
  override readonly MONTHS = this.createRange(12, 1).map((key) => ({ key, value: MONTHS_DICTIONARY[key] }));

  protected override getExpression(): string {
    return `${this.second} ${this.minute} ${this.hour} ${this.day} ${this.month} ? *`;
  }
}
