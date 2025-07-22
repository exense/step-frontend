import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MonthlyDayEditorComponent } from '../monthly-day-editor/monthly-day-editor.component';
import { RANGE_MONTHS_NAMES } from '../../injectables/ranges.tokens';

@Component({
  selector: 'step-yearly-day-editor',
  templateUrl: './yearly-day-editor.component.html',
  styleUrls: ['./yearly-day-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class YearlyDayEditorComponent extends MonthlyDayEditorComponent {
  override readonly _MONTHS = inject(RANGE_MONTHS_NAMES);

  protected override getExpression(): string {
    return `${this.second} ${this.minute} ${this.hour} ${this.day} ${this.month} ? *`;
  }
}
