import { Component, DestroyRef, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { BaseEditorComponent } from '../base-editor/base-editor.component';
import { FormBuilder } from '@angular/forms';
import { RANGE_HOURS } from '../../injectables/ranges.tokens';
import { debounceTime } from 'rxjs';
import { TOOLTIP_HOURS_RANGE } from '../../injectables/tooltip.tokens';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-weekly-time-range-editor',
  templateUrl: './weekly-time-range-editor.component.html',
  styleUrls: ['./weekly-time-range-editor.component.scss'],
  host: {
    class: 'editors-group',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class WeeklyTimeRangeEditorComponent extends BaseEditorComponent implements OnInit {
  private _destroyRef = inject(DestroyRef);
  private _fb = inject(FormBuilder);
  readonly _HOURS = inject(RANGE_HOURS);
  readonly _tooltipHours = inject(TOOLTIP_HOURS_RANGE);

  readonly weeklyTimeRangeForm = this._fb.group({
    dayOfWeek: this._fb.control<string[]>([]),
    hourFrom: this._fb.control<number | null>(0),
    hourTo: this._fb.control<number | null>(this._HOURS[this._HOURS.length - 1].key as number),
  });

  ngOnInit(): void {
    this.setupFormUpdate();
  }

  protected override getExpression(): string {
    const formValue = this.weeklyTimeRangeForm.value;

    const hoursRange = this.formatInterval(formValue.hourFrom, formValue.hourTo);

    let days = (formValue.dayOfWeek ?? []).join(',');
    days = !days ? '*' : `${days} *`;

    return `* * ${hoursRange} ? * ${days}`;
  }

  private setupFormUpdate(): void {
    this.weeklyTimeRangeForm.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.updateExpression());
  }
}
