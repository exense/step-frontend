import { Component, inject, ViewEncapsulation } from '@angular/core';
import { HoursEditorComponent } from '../hours-editor/hours-editor.component';
import { RANGE_MONTHLY_DAYS, RANGE_MONTHS_NUMBERS } from '../../injectables/ranges.tokens';

@Component({
  selector: 'step-monthly-day-editor',
  templateUrl: './monthly-day-editor.component.html',
  styleUrls: ['./monthly-day-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class MonthlyDayEditorComponent extends HoursEditorComponent {
  readonly _MONTHS = inject(RANGE_MONTHS_NUMBERS);
  readonly _DAYS = inject(RANGE_MONTHLY_DAYS);

  protected override hour = 0;
  protected month = this._MONTHS[0].key;

  handleMonthChange(value: number): void {
    this.month = value;
    this.updateExpression();
  }

  protected day = this._DAYS[0].key;

  handleDayChange(value: string | number): void {
    this.day = value;
    this.updateExpression();
  }

  protected override getExpression(): string {
    return `${this.second} ${this.minute} ${this.hour} ${this.day} 1/${this.month} ? *`;
  }
}
