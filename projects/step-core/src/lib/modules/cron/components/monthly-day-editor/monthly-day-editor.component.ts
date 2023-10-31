import { Component, ViewEncapsulation } from '@angular/core';
import { HoursEditorComponent } from '../hours-editor/hours-editor.component';

const createDayLabel = (day: number) => {
  const dayStr = day.toString();
  let suffix: string;
  switch (dayStr[dayStr.length - 1]) {
    case '1':
      suffix = 'st';
      break;
    case '2':
      suffix = 'nd';
      break;
    case '3':
      suffix = 'rd';
      break;
    default:
      suffix = 'th';
      break;
  }
  return `${dayStr}${suffix} Day`;
};

@Component({
  selector: 'step-monthly-day-editor',
  templateUrl: './monthly-day-editor.component.html',
  styleUrls: ['./monthly-day-editor.component.scss'],
  host: {
    class: 'editor-content',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MonthlyDayEditorComponent extends HoursEditorComponent {
  override readonly HOURS = this.createRange(23, 1).map((key) => ({ key, value: key.toString().padStart(2, '0') }));

  readonly MONTHS = this.createRange(12, 1).map((key) => ({ key, value: key.toString() }));

  readonly DAYS = [
    { key: '1W', value: 'First Weekday' },
    ...this.createRange(31, 1).map((key) => ({
      key,
      value: createDayLabel(key),
    })),
    { key: 'LW', value: 'Last Weekday' },
    { key: 'L', value: 'Last Day' },
  ];

  protected month = this.MONTHS[0].key;

  handleMonthChange(value: number): void {
    this.month = value;
    this.updateExpression();
  }

  protected day = this.DAYS[0].key;

  handleDayChange(value: string | number): void {
    this.day = value;
    this.updateExpression();
  }

  protected override getExpression(): string {
    return `${this.second} ${this.minute} ${this.hour} ${this.day} 1/${this.month} ? *`;
  }
}
