import { Directive, forwardRef, Input } from '@angular/core';
import { DateRange } from '../types/date-range';
import { DatePickerBaseDirective } from './date-picker-base.directive';
import { DatePickerComponent } from '../components/date-picker/date-picker.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateAdapterService } from '../injectables/date-adapter.service';
import { DateRangeAdapterService } from '../injectables/date-range-adapter.service';
import { STEP_DATE_TIME_FORMAT_PROVIDERS } from '../injectables/step-date-format-config.providers';
import { DateSingleAdapterService } from '../injectables/date-single-adapter.service';

@Directive({
  selector: 'input[stepDateRangePicker]',
  providers: [
    ...STEP_DATE_TIME_FORMAT_PROVIDERS,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerDirective),
      multi: true,
    },
    DateSingleAdapterService,
    DateRangeAdapterService,
    {
      provide: DateAdapterService,
      useExisting: DateRangeAdapterService,
    },
  ],
  exportAs: 'DateRangePicker',
  standalone: false,
})
export class DateRangePickerDirective extends DatePickerBaseDirective<DateRange> {
  @Input('stepDateRangePicker') override picker?: DatePickerComponent = undefined;

  override isRangeField(): boolean {
    return true;
  }
}
