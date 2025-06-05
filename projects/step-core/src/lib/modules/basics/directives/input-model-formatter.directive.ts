import { Directive, ElementRef, forwardRef, HostListener, inject, Input, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

export interface ModelFormatter<T> {
  parseModel(model: T): string;
  formatModelValue(value?: string, originalModel?: T): T;
}

const DEFAULT_MODEL_FORMATTER: ModelFormatter<any> = {
  parseModel: (model: any) => model,
  formatModelValue: (value?: string, model?: any) => value,
};

type OnChange = (value?: any) => void;
type OnTouch = () => void;

@Directive({
  selector: 'input[stepModelFormatter]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputModelFormatterDirective),
      multi: true,
    },
  ],
  standalone: false,
})
export class InputModelFormatterDirective implements ControlValueAccessor, OnDestroy {
  @Input('stepModelFormatter') formatter = DEFAULT_MODEL_FORMATTER;

  private _input = inject(ElementRef).nativeElement as HTMLInputElement;
  private originalModel?: any;

  private onChange: OnChange = noop;
  private onTouch: OnTouch = noop;

  registerOnChange(fn: OnChange): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._input.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.originalModel = obj;
    const value = this.formatter.parseModel(obj);
    this._input.value = value;
  }

  @HostListener('blur')
  handleTouch(): void {
    this.onTouch();
  }

  @HostListener('input', ['$event'])
  handleInput($event: InputEvent): void {
    const value = ($event.target as HTMLInputElement).value;
    const model = this.formatter.formatModelValue(value, this.originalModel);
    this.onChange(model);
  }

  ngOnDestroy(): void {
    this.onTouch = noop;
    this.onChange = noop;
  }
}
