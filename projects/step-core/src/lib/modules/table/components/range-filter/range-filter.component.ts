import { Component, ElementRef, forwardRef, input, Input, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidatorFn } from '@angular/forms';
import { debounceTime, map, Observable } from 'rxjs';
import { BaseFilterComponent } from '../../../basics/step-basics.module';
import { DateRange } from '../../../date-picker/date-picker.module';

@Component({
  selector: 'step-range-filter',
  templateUrl: './range-filter.component.html',
  styleUrls: ['./range-filter.component.scss'],
  providers: [
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => RangeFilterComponent),
    },
  ],
  exportAs: 'stepRangeFilter',
})
export class RangeFilterComponent extends BaseFilterComponent<DateRange | undefined> {
  @Input() label?: string;
  @ViewChild('filterInput') private filterInput?: ElementRef<HTMLInputElement>;

  protected createControl(fb: FormBuilder): FormControl<DateRange> {
    return fb.nonNullable.control<DateRange>({ start: undefined, end: undefined }, [this.createDateRangeValidator()]);
  }

  protected createControlChangeStream(control: FormControl<DateRange>): Observable<DateRange> {
    return control.valueChanges.pipe(
      debounceTime(200),
      map((value) => value ?? undefined),
    );
  }

  private createDateRangeValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const hasInputValue = !!this.filterInput?.nativeElement?.value;
      if (!control.value && hasInputValue) {
        return { date: 'Invalid date range' };
      }
      return null;
    };
  }
}
