import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { DateTime } from 'luxon';
import { DateFieldContainerService } from '../../injectables/date-field-container.service';
import { CalendarSingleStrategyService } from '../../injectables/calendar-single-strategy.service';
import { CalendarRangeStrategyService } from '../../injectables/calendar-range-strategy.service';
import { CalendarStrategyService } from '../../injectables/calendar-strategy.service';
import { DateSingleAdapterService } from '../../injectables/date-single-adapter.service';
import { DateRange } from '../../types/date-range';
import { TimeRange } from '../../types/time-range';
import { Time } from '../../types/time';

@Component({
  selector: 'step-date-picker-content',
  templateUrl: './date-picker-content.component.html',
  styleUrls: ['./date-picker-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    DateSingleAdapterService,
    CalendarSingleStrategyService,
    CalendarRangeStrategyService,
    {
      provide: CalendarStrategyService,
      useFactory: () => {
        const _isRange = inject(DateFieldContainerService).isRangeField();
        return _isRange ? inject(CalendarRangeStrategyService) : inject(CalendarSingleStrategyService);
      },
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerContentComponent {
  private _fieldContainer = inject<DateFieldContainerService<DateTime | DateRange>>(DateFieldContainerService);
  private _calendarStrategy = inject(CalendarStrategyService);
  private adapter = this._fieldContainer.dateAdapter();

  readonly withTime = this._fieldContainer.withTime();

  model = this._fieldContainer.getModel();

  selected = this._calendarStrategy.getCalendarModel(this.model);
  startAt = this._calendarStrategy.getStartAt(this.model);

  handleSelectionChange(date: DateTime | undefined | null): void {
    const changedModel = this._calendarStrategy.handleDateSelection(date, this.model, this.withTime);
    this.updateModel(changedModel);
  }

  handleTimeChange(time: Time | TimeRange | undefined | null): void {
    const changedModel = this._calendarStrategy.handleTimeSelection(time, this.model);
    this.updateModel(changedModel);
  }

  private updateModel(model: DateTime | DateRange): void {
    if (this.adapter?.areEqual(model, this.model)) {
      return;
    }

    this.model = model;
    this.selected = this._calendarStrategy.getCalendarModel(this.model);
    this._fieldContainer.setModel(model);
  }
}
