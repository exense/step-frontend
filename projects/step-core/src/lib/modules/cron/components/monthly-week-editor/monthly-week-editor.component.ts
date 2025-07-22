import { Component, inject, ViewEncapsulation } from '@angular/core';
import { HoursEditorComponent } from '../hours-editor/hours-editor.component';
import { RANGE_DAY_NUM, RANGE_MONTHS_NUMBERS, RANGE_WEEK_DAY } from '../../injectables/ranges.tokens';

@Component({
  selector: 'step-monthly-week-editor',
  templateUrl: './monthly-week-editor.component.html',
  styleUrls: ['./monthly-week-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class MonthlyWeekEditorComponent extends HoursEditorComponent {
  readonly _MONTHS = inject(RANGE_MONTHS_NUMBERS);
  readonly _DAY_NUM = inject(RANGE_DAY_NUM);
  readonly _WEEK_DAY = inject(RANGE_WEEK_DAY);

  protected override hour = 0;

  protected month = this._MONTHS[0].key;

  protected dayNum = this._DAY_NUM[0].key;

  protected weekDay = this._WEEK_DAY[0].key;

  handleMonthChange(month: number): void {
    this.month = month;
    this.updateExpression();
  }

  handleDayNumChange(dayNum: string): void {
    this.dayNum = dayNum;
    this.updateExpression();
  }

  handleWeekDayChange(weekDay: string): void {
    this.weekDay = weekDay;
    this.updateExpression();
  }

  protected override getExpression(): string {
    return `${this.second} ${this.minute} ${this.hour} ? 1/${this.month} ${this.weekDay}${this.dayNum} *`;
  }
}
