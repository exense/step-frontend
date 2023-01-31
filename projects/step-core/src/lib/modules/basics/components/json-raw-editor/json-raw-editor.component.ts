import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NgControl, ValidatorFn } from '@angular/forms';
import { debounceTime, distinctUntilChanged, noop, Subject, combineLatest, takeUntil } from 'rxjs';
type OnChange = (value?: any) => void;
type OnTouch = () => void;

const JSON_VALIDATOR: ValidatorFn = (control: AbstractControl) => {
  try {
    if (!control.value) {
      return null;
    }
    JSON.parse(control.value);
  } catch (e) {
    return { jsonValidator: 'invalid' };
  }
  return null;
};

@Component({
  selector: 'step-json-raw-editor',
  templateUrl: './json-raw-editor.component.html',
  styleUrls: ['./json-raw-editor.component.scss'],
})
export class JsonRawEditorComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private terminator$ = new Subject<any>();

  private onChange: OnChange = noop;

  private onTouch: OnTouch = noop;

  private internalValue?: any;
  private internalJsonValue?: string;

  protected rawValueFormControl = new FormControl('', JSON_VALIDATOR);

  constructor(@Optional() public _ngControl?: NgControl) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  registerOnChange(fn: OnChange): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.rawValueFormControl.disable() : this.rawValueFormControl.enable();
  }

  writeValue(obj: any): void {
    this.internalValue = obj;
    let jsonValue = '';
    try {
      if (obj) {
        jsonValue = JSON.stringify(obj);
      }
    } catch (e) {
      console.error(e);
    }
    this.internalJsonValue = jsonValue;
    this.rawValueFormControl.setValue(jsonValue);
  }

  ngOnInit(): void {
    const valueChange$ = this.rawValueFormControl.valueChanges.pipe(debounceTime(1500));

    const statusChange$ = this.rawValueFormControl.statusChanges.pipe(distinctUntilChanged());

    combineLatest([valueChange$, statusChange$])
      .pipe(takeUntil(this.terminator$))
      .subscribe(([value, status]) => {
        if (status !== 'VALID' || value === this.internalJsonValue) {
          return;
        }
        let newValue: string | undefined;
        try {
          newValue = !value ? undefined : JSON.parse(value);
        } catch (e) {
          return;
        }

        this.internalJsonValue = value || '';
        this.internalValue = newValue;
        this.onChange(newValue);
      });
  }

  ngOnDestroy(): void {
    this.onChange = noop;
    this.onTouch = noop;
    this.terminator$.next({});
    this.terminator$.complete();
  }

  onBlur(): void {
    if (this.rawValueFormControl.invalid) {
      this.rawValueFormControl.setValue(this.internalJsonValue || '');
    }
    this.onTouch();
  }
}
