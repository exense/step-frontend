import { Component, TrackByFunction, ViewEncapsulation } from '@angular/core';
import { KeyValue } from '@angular/common';
import { HoursEditorComponent } from '../hours-editor/hours-editor.component';

interface DayInfo extends KeyValue<string, string> {
  isSelected?: boolean;
}

const createDayInfo = (key: string, value: string): DayInfo => ({ key, value });

@Component({
  selector: 'step-weekly-editor',
  templateUrl: './weekly-editor.component.html',
  styleUrls: ['./weekly-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WeeklyEditorComponent extends HoursEditorComponent {
  override readonly HOURS = this.createRange(23, 1).map((key) => ({ key, value: key.toString().padStart(2, '0') }));

  protected readonly trackByDay: TrackByFunction<DayInfo> = (_, item) => item.key;

  protected readonly selectedDays: DayInfo[] = [
    createDayInfo('MON', 'Monday'),
    createDayInfo('TUE', 'Tuesday'),
    createDayInfo('WED', 'Wednesday'),
    createDayInfo('THU', 'Thursday'),
    createDayInfo('FRI', 'Friday'),
    createDayInfo('SAT', 'Saturday'),
    createDayInfo('SUN', 'Sunday'),
  ];

  protected handleDayChange(day: DayInfo): void {
    day.isSelected = !day.isSelected;
    this.updateExpression();
  }

  protected override getExpression(): string {
    const days = this.selectedDays
      .filter((day) => day.isSelected)
      .map((day) => day.key)
      .join(',');

    return `${this.second} ${this.minute} ${this.hour} ? * ${!days ? '*' : `${days} *`}`;
  }
}
