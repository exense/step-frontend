import { Component, inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormBuilder, NgControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, Subject, takeUntil } from 'rxjs';

type OnChange = (value: string[]) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-string-array-input',
  templateUrl: './string-array-input.component.html',
  styleUrls: ['./string-array-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StringArrayInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() label?: string;
  @Input() showRequiredMarker: boolean = false;
  @Input() tooltip?: string;
  @Input() errorsDictionary?: Record<string, string>;

  private terminator$ = new Subject<void>();
  private _fb = inject(FormBuilder).nonNullable;

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected internalControl = this._fb.control<string>('');

  constructor(readonly _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  protected handleBlur(): void {
    this.onTouch?.();
  }

  registerOnChange(fn: OnChange): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.internalControl.disable();
    } else {
      this.internalControl.enable();
    }
  }

  writeValue(value?: string[]): void {
    const internalValue = (value ?? []).join(', ');
    this.internalControl.setValue(internalValue, { emitEvent: false });
  }

  ngOnInit(): void {
    this.internalControl.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map((value) =>
          (value ?? '')
            .split(',')
            .map((item) => item.trim())
            .filter((item) => !!item)
        ),
        takeUntil(this.terminator$)
      )
      .subscribe((value: string[]) => this.onChange?.(value));
  }

  ngOnDestroy(): void {
    this.terminator$.next();
    this.terminator$.complete();
  }
}
