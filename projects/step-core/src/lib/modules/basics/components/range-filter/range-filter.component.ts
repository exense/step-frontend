import { Component, ElementRef, forwardRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { LuxonDateAdapter, MAT_LUXON_DATE_ADAPTER_OPTIONS } from '@angular/material-luxon-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { debounceTime, map, Observable, takeUntil } from 'rxjs';
import { DateTime } from 'luxon';
import { BaseFilterComponent } from '../base-filter/base-filter.component';

export interface DateRange {
  start?: DateTime;
  end?: DateTime;
}

@Component({
  selector: 'step-range-filter',
  templateUrl: './range-filter.component.html',
  styleUrls: ['./range-filter.component.scss'],
  providers: [
    {
      provide: MAT_LUXON_DATE_ADAPTER_OPTIONS,
      useValue: { useUtc: false },
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'dd.MM.yy HH:mm:ss',
        },
        display: {
          dateInput: 'dd.MM.yy HH:mm:ss',
          monthYearLabel: 'MMM yy',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM yy',
        },
      },
    },
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
    },
    {
      provide: BaseFilterComponent,
      useExisting: forwardRef(() => RangeFilterComponent),
    },
  ],
  exportAs: 'stepRangeFilter',
  encapsulation: ViewEncapsulation.None,
})
export class RangeFilterComponent extends BaseFilterComponent<DateRange | undefined> {
  @Input() label?: string;
  @ViewChild('startDate') private startDateInput?: ElementRef;
  @ViewChild('endDate') private endDateInput?: ElementRef;

  readonly filterGroup = this.filterControl as AbstractControl as FormGroup;

  protected createControl(fb: FormBuilder): FormControl<DateRange> {
    return fb.group(
      {
        start: fb.control<DateTime | null>(null),
        end: fb.control<DateTime | null>(null),
      },
      {
        validators: this.createDateValidator(),
      }
    ) as AbstractControl<DateRange> as FormControl<DateRange>;
  }

  protected clear(): void {
    this.filterGroup.setValue({ start: null, end: null });
  }

  protected createControlChangeStream(control: FormControl<DateRange>): Observable<DateRange> {
    return control.valueChanges.pipe(
      debounceTime(200),
      map((value) => value || undefined)
    );
  }

  private createDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const hasInputValues = !!this.startDateInput?.nativeElement?.value || !!this.endDateInput?.nativeElement?.value;

      if (control.value === null && hasInputValues) {
        return {
          date: 'Invalid date',
        };
      }
      return null;
    };
  }

  protected override transformFilterValueToControlValue(value: DateRange | undefined): DateRange | undefined {
    if (value) {
      return value;
    }
    return { start: undefined, end: undefined };
  }

  protected override setupChange(): void {
    const endCtrl = this.filterGroup.controls['end'] as FormControl<DateTime | null>;
    this.setupEndDateChange(endCtrl);
    super.setupChange();
  }

  private setupEndDateChange(endCtrl: FormControl<DateTime | null>): void {
    endCtrl.valueChanges.pipe(debounceTime(100), takeUntil(this.terminator$)).subscribe((endDate) => {
      if (endDate && endDate.hour === 0 && endDate.minute === 0 && endDate.second === 0) {
        const newEndDate = endDate.set({
          hour: 23,
          minute: 59,
          second: 59,
        });
        endCtrl.setValue(newEndDate);
      }
    });
  }
}
