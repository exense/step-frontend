import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DateTime } from 'luxon';
import { AbstractControl, FormBuilder, FormControl, ValidatorFn } from '@angular/forms';
import { debounceTime, map, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'step-date-filter',
  templateUrl: './date-filter.component.html',
  styleUrls: ['./date-filter.component.scss'],
})
export class DateFilterComponent implements OnInit, OnDestroy {
  private terminator$ = new Subject<unknown>();

  @Output() dateChanged = new EventEmitter<DateTime | undefined>();

  @ViewChild('dateInput') private dateInput?: ElementRef;

  readonly dateControl: FormControl;

  constructor(formBuilder: FormBuilder) {
    this.dateControl = formBuilder.control('', [this.createDateValidator()]);
  }

  ngOnInit() {
    this.dateControl.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => value || undefined),
        takeUntil(this.terminator$)
      )
      .subscribe((date) => this.dateChanged.emit(date));
  }

  ngOnDestroy(): void {
    this.terminator$.next(undefined);
    this.terminator$.complete();
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
