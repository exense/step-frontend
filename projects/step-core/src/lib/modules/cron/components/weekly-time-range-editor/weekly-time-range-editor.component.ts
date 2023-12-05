import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BaseEditorComponent } from '../base-editor/base-editor.component';
import { FormBuilder } from '@angular/forms';
import { RANGE_HOURS } from '../../injectables/ranges.tokens';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'step-weekly-time-range-editor',
  templateUrl: './weekly-time-range-editor.component.html',
  styleUrls: ['./weekly-time-range-editor.component.scss'],
  host: {
    class: 'editors-group',
  },
  encapsulation: ViewEncapsulation.None,
})
export class WeeklyTimeRangeEditorComponent extends BaseEditorComponent implements OnInit, OnDestroy {
  private terminator$ = new Subject<void>();

  private _fb = inject(FormBuilder);
  readonly _HOURS = inject(RANGE_HOURS);

  readonly weeklyTimeRangeForm = this._fb.group({
    dayOfWeek: this._fb.control<string[]>([]),
    hourFrom: this._fb.control<number | null>(null),
    hourTo: this._fb.control<number | null>(null),
  });

  ngOnInit(): void {
    this.setupFormUpdate();
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }

  protected override getExpression(): string {
    const formValue = this.weeklyTimeRangeForm.value;

    const hoursRange =
      formValue.hourFrom === null || formValue.hourTo === null ? '*' : `${formValue.hourFrom}-${formValue.hourTo}`;

    let days = (formValue.dayOfWeek ?? []).join(',');
    days = !days ? '*' : `${days} *`;

    return `* * ${hoursRange} ? * ${days}`;
  }

  private setupFormUpdate(): void {
    this.weeklyTimeRangeForm.valueChanges
      .pipe(debounceTime(300), takeUntil(this.terminator$))
      .subscribe(() => this.updateExpression());
  }
}
