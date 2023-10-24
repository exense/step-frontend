import { Component, ViewEncapsulation } from '@angular/core';
import { HoursEditorComponent } from '../hours-editor/hours-editor.component';

@Component({
  selector: 'step-monthly-week-editor',
  templateUrl: './monthly-week-editor.component.html',
  styleUrls: ['./monthly-week-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MonthlyWeekEditorComponent extends HoursEditorComponent {
  override readonly HOURS = this.createRange(23, 1).map((key) => ({ key, value: key.toString().padStart(2, '0') }));

  readonly MONTHS = this.createRange(12, 1).map((key) => ({ key, value: key.toString() }));

  readonly DAY_NUM = [
    { key: '#1', value: 'First' },
    { key: '#2', value: 'Second' },
    { key: '#3', value: 'Third' },
    { key: '#4', value: 'Fourth' },
    { key: '#5', value: 'Fifth' },
    { key: 'L', value: 'Last' },
  ];

  readonly WEEK_DAY = [
    { key: 'MON', value: 'Monday' },
    { key: 'TUE', value: 'Tuesday' },
    { key: 'WED', value: 'Wednesday' },
    { key: 'THU', value: 'Thursday' },
    { key: 'FRI', value: 'Friday' },
    { key: 'SAT', value: 'Saturday' },
    { key: 'SUN', value: 'Sunday' },
  ];

  protected month = this.MONTHS[0].key;

  protected dayNum = this.DAY_NUM[0].key;

  protected weekDay = this.WEEK_DAY[0].key;

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
