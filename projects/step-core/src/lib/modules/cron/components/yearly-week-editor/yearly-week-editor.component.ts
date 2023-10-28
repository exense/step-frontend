import { Component, ViewEncapsulation } from '@angular/core';
import { MonthlyWeekEditorComponent } from '../monthly-week-editor/monthly-week-editor.component';
import { MONTHS_DICTIONARY } from '../../types/months';

@Component({
  selector: 'step-yearly-week-editor',
  templateUrl: './yearly-week-editor.component.html',
  styleUrls: ['./yearly-week-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
})
export class YearlyWeekEditorComponent extends MonthlyWeekEditorComponent {
  override readonly MONTHS = this.createRange(12, 1).map((key) => ({ key, value: MONTHS_DICTIONARY[key] }));

  protected override getExpression(): string {
    return `${this.second} ${this.minute} ${this.hour} ? ${this.month} ${this.weekDay}${this.dayNum} *`;
  }
}
