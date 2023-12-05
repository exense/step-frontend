import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BaseEditorComponent } from '../base-editor/base-editor.component';
import { FormBuilder } from '@angular/forms';
import { DateTime } from 'luxon';
import { RANGE_DAYS, RANGE_HOURS, RANGE_MONTHS_NAMES, RANGE_YEARS } from '../../injectables/ranges.tokens';
import { debounceTime, distinctUntilChanged, startWith, Subject, takeUntil } from 'rxjs';

enum TimeRangeType {
  CONCRETE_DATE = 'CONCRETE_DATE',
  DAYS_RANGE = 'DAYS_RANGE',
}

@Component({
  selector: 'step-time-range-editor',
  templateUrl: './time-range-editor.component.html',
  styleUrls: ['./time-range-editor.component.scss'],
  host: {
    class: 'editors-group',
  },
  encapsulation: ViewEncapsulation.None,
})
export class TimeRangeEditorComponent extends BaseEditorComponent implements OnInit, OnDestroy {
  private terminator$ = new Subject<void>();

  private _fb = inject(FormBuilder);
  readonly _MONTHS = inject(RANGE_MONTHS_NAMES);
  readonly _YEARS = inject(RANGE_YEARS);
  readonly _DAYS = inject(RANGE_DAYS);
  readonly _HOURS = inject(RANGE_HOURS);

  readonly TimeRangeType = TimeRangeType;

  readonly timeRangeForm = this._fb.group({
    type: this._fb.control<TimeRangeType>(TimeRangeType.CONCRETE_DATE),
    date: this._fb.control<DateTime | null>(null),
    daysRange: this._fb.group({
      month: this._fb.control<number>(this._MONTHS[0].key as number),
      year: this._fb.control<number>(new Date().getFullYear()),
      dayFrom: this._fb.control<number>(this._DAYS[0].key as number),
      dayTo: this._fb.control<number>(this._DAYS[this._DAYS.length - 1].key as number),
    }),
    hourFrom: this._fb.control<number | null>(null),
    hourTo: this._fb.control<number | null>(null),
  });

  ngOnInit(): void {
    this.setupFormUpdate();
    this.setupFieldsDisableState();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  protected override getExpression(): string {
    const formValue = this.timeRangeForm.value;
    console.log(formValue);
    if (!formValue.type) {
      return '* * * ? * *';
    }

    const hoursRange =
      formValue.hourFrom === null || formValue.hourTo === null ? '*' : `${formValue.hourFrom}-${formValue.hourTo}`;

    if (formValue.type === TimeRangeType.CONCRETE_DATE) {
      const day = formValue.date?.day?.toString() ?? '*';
      const month = formValue.date?.month?.toString() ?? '*';
      const year = formValue.date?.year?.toString() ?? '*';
      return `* * ${hoursRange} ${day} ${month} ? ${year}`;
    }

    const daysRange =
      !formValue.daysRange?.dayFrom || !formValue.daysRange?.dayTo
        ? '*'
        : `${formValue.daysRange.dayFrom}-${formValue.daysRange.dayTo}`;
    const month = formValue.daysRange?.month?.toString() ?? '*';
    const year = formValue.daysRange?.year?.toString() ?? '*';

    return `* * ${hoursRange} ${daysRange} ${month} ? ${year}`;
  }

  private setupFormUpdate(): void {
    this.timeRangeForm.valueChanges
      .pipe(debounceTime(300), takeUntil(this.terminator$))
      .subscribe(() => this.updateExpression());
  }

  private setupFieldsDisableState(): void {
    this.timeRangeForm.controls.type.valueChanges
      .pipe(startWith(this.timeRangeForm.value.type), distinctUntilChanged(), takeUntil(this.terminator$))
      .subscribe((type) => {
        switch (type) {
          case TimeRangeType.CONCRETE_DATE:
            this.timeRangeForm.controls.date.enable({ onlySelf: true });
            this.timeRangeForm.controls.daysRange.disable({ onlySelf: true });
            break;
          case TimeRangeType.DAYS_RANGE:
            this.timeRangeForm.controls.date.disable({ onlySelf: true });
            this.timeRangeForm.controls.daysRange.enable({ onlySelf: true });
            break;
          default:
            break;
        }
      });
  }
}
