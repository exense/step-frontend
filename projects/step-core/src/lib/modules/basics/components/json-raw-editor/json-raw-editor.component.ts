import { Component, EventEmitter, Output, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, noop, Subject, combineLatest, takeUntil } from 'rxjs';
import { jsonValidator } from '../../types/validators/json-validator';
type OnChange = (value?: any) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-json-raw-editor',
  templateUrl: './json-raw-editor.component.html',
  styleUrls: ['./json-raw-editor.component.scss'],
})
export class JsonRawEditorComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Output() blur = new EventEmitter<void>();

  private terminator$ = new Subject<void>();

  private onChange: OnChange = noop;

  protected onTouch: OnTouch = noop;

  protected internalValue?: any;
  protected internalJsonValue?: string;

  protected rawValueFormControl = new FormControl('', (ctrl) => {
    if (this.isAutoValidateJson) {
      return jsonValidator(ctrl);
    }
    return null;
  });

  @Input() label?: string;
  @Input() isAutoValidateJson = true;

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
        jsonValue = this.stringify(obj);
      }
    } catch (e) {
      if (this.isAutoValidateJson) {
        console.error(e);
      } else {
        jsonValue = obj.toString();
      }
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
          if (this.isAutoValidateJson) {
            return;
          }
          newValue = value ?? undefined;
        }

        this.internalJsonValue = value || '';
        this.internalValue = newValue;
        this.onChange(newValue);
      });
  }

  ngOnDestroy(): void {
    this.onChange = noop;
    this.onTouch = noop;
    this.terminator$.next();
    this.terminator$.complete();
  }

  onBlur(): void {
    if (this.rawValueFormControl.invalid) {
      this.rawValueFormControl.setValue(this.internalJsonValue || '');
    }
    this.blur.emit();
    this.onTouch();
  }

  protected stringify(value: any): string {
    return JSON.stringify(value);
  }
}
