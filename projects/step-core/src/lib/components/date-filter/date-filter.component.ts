import { Component, EventEmitter, Output } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DateTime } from 'luxon';

@Component({
  selector: 'step-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss'],
})
export class DateFilterComponent {
  @Output() dateChanged = new EventEmitter<DateTime | undefined>();

  handleDateChange(event: MatDatepickerInputEvent<DateTime>): void {
    const date = event?.value || undefined;
    this.dateChanged.emit(date);
  }
}
