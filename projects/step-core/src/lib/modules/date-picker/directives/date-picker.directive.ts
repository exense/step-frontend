import { Directive, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateTime } from 'luxon';
import { DatePickerBaseDirective } from './date-picker-base.directive';
import { DateSingleAdapterService } from '../injectables/date-single-adapter.service';
import { DateAdapterService } from '../injectables/date-adapter.service';
import { DatePickerComponent } from '../components/date-picker/date-picker.component';
import { STEP_DATE_TIME_FORMAT_PROVIDERS } from '../injectables/step-date-format-config.providers';

@Directive({
  selector: 'input[stepDatePicker]',
  providers: [
    ...STEP_DATE_TIME_FORMAT_PROVIDERS,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerDirective),
      multi: true,
    },
    DateSingleAdapterService,
    {
      provide: DateAdapterService,
      useExisting: DateSingleAdapterService,
    },
  ],
  exportAs: 'DatePicker',
  standalone: false,
})
export class DatePickerDirective extends DatePickerBaseDirective<DateTime> {
  @Input('stepDatePicker') override picker?: DatePickerComponent = undefined;

  override isRangeField(): boolean {
    return false;
  }
}
