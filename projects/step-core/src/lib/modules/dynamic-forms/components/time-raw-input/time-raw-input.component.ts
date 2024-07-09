import { Component, DestroyRef, EventEmitter, inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { TimeInputComponent, TimeUnit } from '../../../basics/step-basics.module';
import { FormControl, NgControl } from '@angular/forms';
import { NUMBER_CHARS_POSITIVE_ONLY } from '../../shared/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-time-raw-input',
  templateUrl: './time-raw-input.component.html',
  styleUrls: ['./time-raw-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TimeRawInputComponent extends TimeInputComponent {
  @Input() parentControl?: NgControl;
  @Input() placeholder?: string;

  @Output() toggleDynamicExpression = new EventEmitter<void>();

  readonly allowedChars = NUMBER_CHARS_POSITIVE_ONLY;

  private _destroyRef = inject(DestroyRef);

  filterMultiControl: FormControl<string | null> = new FormControl<string>('');
  dropdownItemsFiltered: KeyValue<TimeUnit, string>[] = [];

  ngAfterContentInit(): void {
    this.dropdownItemsFiltered = [...this.measureItems];
    this.filterMultiControl.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((value) => {
      if (value) {
        this.dropdownItemsFiltered = this.measureItems.filter((item) =>
          item.value.toLowerCase().includes(value.toLowerCase()),
        );
      } else {
        this.dropdownItemsFiltered = [...this.measureItems];
      }
    });
  }
}
