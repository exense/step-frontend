import { ChangeDetectionStrategy, Component, effect, inject, input, ViewEncapsulation } from '@angular/core';
import { DateTime } from 'luxon';
import { DateFieldContainerService } from '../../injectables/date-field-container.service';
import { CalendarSingleStrategyService } from '../../injectables/calendar-single-strategy.service';
import { CalendarRangeStrategyService } from '../../injectables/calendar-range-strategy.service';
import { CalendarStrategyService } from '../../injectables/calendar-strategy.service';
import { DateSingleAdapterService } from '../../injectables/date-single-adapter.service';
import { DateRange } from '../../types/date-range';
import { TimeRange } from '../../types/time-range';
import { Time } from '../../types/time';
import { RELATIVE_TIME_OPTIONS } from '../../injectables/relative-time-options.token';
import { TimeOption } from '../../types/time-option';
import { Tab } from '../../../tabs';

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
  standalone: false,
})
export class DatePickerContentComponent {
  /** @Input() **/
  customRelativeRangeOptions?: TimeOption[];

  private _fieldContainer = inject<DateFieldContainerService<DateTime | DateRange>>(DateFieldContainerService);
  private _calendarStrategy = inject(CalendarStrategyService);
  protected _relativeTimeOptions$ = inject(RELATIVE_TIME_OPTIONS);
  private adapter = this._fieldContainer.dateAdapter();
  private predefinedTime?: Time | TimeRange | null;

  readonly withTime = this._fieldContainer.withTime();
  readonly withRelativeTime = this._fieldContainer.withRelativeTime();

  model = this._fieldContainer.getModel();

  selected = this._calendarStrategy.getCalendarModel(this.model);
  startAt = this._calendarStrategy.getStartAt(this.model);

  handleSelectionChange(date: DateTime | undefined | null): void {
    const keepTime = this.withTime || this.withRelativeTime;
    let changedModel = this._calendarStrategy.handleDateSelection(date, this.model, keepTime);
    if (this.predefinedTime) {
      changedModel = this._calendarStrategy.handleTimeSelection(this.predefinedTime, changedModel);
      this.predefinedTime = undefined;
    }
    this.handleRelativeOptionChange(undefined);
    this.updateModel(changedModel);
  }

  handleTimeChange(time: Time | TimeRange | undefined | null): void {
    if (this._calendarStrategy.isCurrentSelectionEmpty(this.model)) {
      this.predefinedTime = time;
      return;
    }
    const changedModel = this._calendarStrategy.handleTimeSelection(time, this.model);
    this.handleRelativeOptionChange(undefined);
    this.updateModel(changedModel);
  }

  handleRelativeRangeChange(range: DateRange): void {
    const changedModel = this._calendarStrategy.pickRelativeTime(range);
    this.updateModel(changedModel);
  }

  handleRelativeOptionChange(timeOption?: TimeOption): void {
    if (!this.withRelativeTime) {
      return;
    }
    this._fieldContainer.handleRelativeOptionChange(timeOption);
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
