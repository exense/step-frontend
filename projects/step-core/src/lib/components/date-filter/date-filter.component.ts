import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DateTime } from 'luxon';

@Component({
  selector: 'step-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss'],
})
export class DateFilterComponent {
  @Output() dateChanged = new EventEmitter<string>();

  @Input() outputFormat = 'dd.MM.yyyy';

  handleDateChange(event: MatDatepickerInputEvent<DateTime>): void {
    const date = event?.value ? event.value.toFormat(this.outputFormat) : '';
    this.dateChanged.emit(date);
  }
}
