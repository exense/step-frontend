import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BaseEditorComponent } from '../base-editor/base-editor.component';
import { RANGE_HOURS, RANGE_MINUTES } from '../../injectables/ranges.tokens';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { AlertType } from '../../../basics/types/alert-type.enum';
import { TOOLTIP_HOURS_RANGE, TOOLTIP_MINUTES_RANGE } from '../../injectables/tooltip.tokens';

@Component({
  selector: 'step-any-date-range-editor',
  templateUrl: './any-date-range-editor.component.html',
  styleUrls: ['./any-date-range-editor.component.scss'],
  host: {
    class: 'editors-group',
  },
  encapsulation: ViewEncapsulation.None,
})
export class AnyDateRangeEditorComponent extends BaseEditorComponent implements OnInit, OnDestroy {
  private terminator$ = new Subject<void>();

  private _fb = inject(FormBuilder);
  readonly _MINUTES = inject(RANGE_MINUTES);
  readonly _HOURS = inject(RANGE_HOURS);
  readonly _tooltipMinutes = inject(TOOLTIP_MINUTES_RANGE);
  readonly _tooltipHours = inject(TOOLTIP_HOURS_RANGE);

  readonly anyDateRangeForm = this._fb.group({
    minuteFrom: this._fb.control<number>(0),
    minuteTo: this._fb.control<number>(this._MINUTES[this._MINUTES.length - 1].key as number),
    hourFrom: this._fb.control<number>(0),
    hourTo: this._fb.control<number>(this._HOURS[this._HOURS.length - 1].key as number),
  });

  readonly AlertType = AlertType;

  ngOnInit(): void {
    this.setupFormUpdate();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  protected override getExpression(): string {
    const formValue = this.anyDateRangeForm.value;
    const minutesRange = this.formatInterval(formValue.minuteFrom, formValue.minuteTo);
    const hoursRange = this.formatInterval(formValue.hourFrom, formValue.hourTo);
    return `* ${minutesRange} ${hoursRange} ? * *`;
  }

  private setupFormUpdate(): void {
    this.anyDateRangeForm.valueChanges
      .pipe(debounceTime(300), takeUntil(this.terminator$))
      .subscribe(() => this.updateExpression());
  }
}
