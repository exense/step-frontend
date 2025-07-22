import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MonthlyWeekEditorComponent } from '../monthly-week-editor/monthly-week-editor.component';
import { RANGE_MONTHS_NAMES } from '../../injectables/ranges.tokens';

@Component({
  selector: 'step-yearly-week-editor',
  templateUrl: './yearly-week-editor.component.html',
  styleUrls: ['./yearly-week-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class YearlyWeekEditorComponent extends MonthlyWeekEditorComponent {
  override readonly _MONTHS = inject(RANGE_MONTHS_NAMES);

  protected override getExpression(): string {
    return `${this.second} ${this.minute} ${this.hour} ? ${this.month} ${this.weekDay}${this.dayNum} *`;
  }
}
