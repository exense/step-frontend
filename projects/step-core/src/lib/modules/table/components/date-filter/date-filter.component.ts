import { Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidatorFn } from '@angular/forms';
import { DateTime } from 'luxon';
import { debounceTime, map, Observable } from 'rxjs';
import { BaseFilterComponent } from '../../../basics/step-basics.module';
import { DatePickerComponent } from '../../../date-picker/date-picker.module';

@Component({
  selector: 'step-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss'],
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => DateFilterComponent),
    },
  ],
  exportAs: 'stepDateFilter',
  standalone: false,
})
export class DateFilterComponent extends BaseFilterComponent<DateTime | undefined, DateTime | null> {
  @Input() label?: string;
  @Input() readonlyInput = false;
  @Input() initialDate = false;

  @ViewChild('dateInput') private dateInput?: ElementRef;
  @ViewChild('picker') readonly stepPicker?: DatePickerComponent;

  protected override createControl(fb: FormBuilder): FormControl<DateTime | null> {
    return fb.control<DateTime | null>(null, [this.createDateValidator()]);
  }

  protected override createControlChangeStream(
    control: FormControl<DateTime | null>,
  ): Observable<DateTime | undefined> {
    return control.valueChanges.pipe(
      debounceTime(200),
      map((value) => value || undefined),
    );
  }

  protected override transformFilterValueToControlValue(value?: DateTime): DateTime | null {
    return value ?? null;
  }

  private createDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      // If date is null, but input has values - it means that date wasn't parsed
      if (control.value === null && !!this.dateInput?.nativeElement?.value) {
        return {
          date: 'Invalid date',
        };
      }
      return null;
    };
  }
}
