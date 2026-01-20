import { NgModule } from '@angular/core';
import { StepBasicsModule } from '../basics/step-basics.module';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { DatePickerDirective } from './directives/date-picker.directive';
import { DatePickerContentComponent } from './components/date-picker-content/date-picker-content.component';
import { DateRangePickerDirective } from './directives/date-range-picker.directive';
import { SingleTimePickerComponent } from './components/single-time-picker/single-time-picker.component';
import { RangeTimePickerComponent } from './components/range-time-picker/range-time-picker.component';
import { TimePickerComponent } from './components/time-picker/time-picker.component';
import { RelativeTimePickerComponent } from './components/relative-time-picker/relative-time-picker.component';

@NgModule({
  declarations: [
    DatePickerComponent,
    DatePickerDirective,
    DatePickerContentComponent,
    DateRangePickerDirective,
    SingleTimePickerComponent,
    RangeTimePickerComponent,
    TimePickerComponent,
    RelativeTimePickerComponent,
  ],
  imports: [StepBasicsModule],
  exports: [DatePickerComponent, DatePickerDirective, DateRangePickerDirective, RelativeTimePickerComponent],
})
export class DatePickerModule {}

export * from './components/date-picker/date-picker.component';
export * from './directives/date-picker.directive';
export * from './directives/date-range-picker.directive';
export * from './types/date-range';
export * from './types/time-option';
export * from './injectables/default-relative-time-options.token';
export * from './injectables/relative-time-options.token';
export * from './injectables/date-utils.service';
export * from './injectables/date-single-adapter.service';
export * from './injectables/date-range-adapter.service';
export {
  StepDateFormatConfig,
  STEP_DATE_FORMAT_CONFIG,
  STEP_DATE_TIME_FORMAT_PROVIDERS,
} from './injectables/step-date-format-config.providers';
