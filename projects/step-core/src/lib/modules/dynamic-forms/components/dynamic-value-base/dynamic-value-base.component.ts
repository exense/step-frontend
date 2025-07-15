import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DynamicValueString } from '../../../../client/step-client-module';
import { ControlValueAccessor, NgControl } from '@angular/forms';

interface DynamicValueBase<T> extends Omit<DynamicValueString, 'value'> {
  value?: T;
}

type ValueType<T> = T extends DynamicValueBase<infer V> ? V : T;

type OnChange<T> = (dynamicValue: T) => void;
type OnTouch = () => void;

@Component({
  template: '',
  standalone: false,
})
export abstract class DynamicValueBaseComponent<D extends DynamicValueBase<T>, T = ValueType<D>>
  implements ControlValueAccessor
{
  @Input() label?: string;
  @Input() placeholder: string = '';
  @Input() tooltip?: string;
  @Input() showRequiredMarker: boolean = false;

  @Output() blur = new EventEmitter<void>();

  private onChange?: OnChange<D>;
  private onTouch?: OnTouch;

  private originalValue?: D;

  value: T = this.defaultConstantValue();
  dynamic: boolean = false;
  expression: string = '';
  isDisabled: boolean = false;

  protected constructor(public _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  registerOnChange(onChange: OnChange<D>): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch: OnTouch): void {
    this.onTouch = onTouch;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(dynamicValue: D): void {
    this.originalValue = dynamicValue;
    this.value = dynamicValue?.value ?? this.defaultConstantValue();
    this.dynamic = dynamicValue?.dynamic ?? false;
    this.expression = dynamicValue?.expression ?? '';
  }

  onValueChange(value?: T): void {
    this.value = value ?? this.defaultConstantValue();
    this.emitChanges();
  }

  onBlur(): void {
    this.onTouch?.();
    this.blur.emit();
  }

  toggleDynamicExpression(dynamic: boolean): void {
    if (dynamic) {
      this.expression = this.convertValueToExpression(this.value);
      this.value = this.defaultConstantValue();
    } else {
      this.value = this.convertExpressionToValue(this.expression);
      this.expression = '';
    }
    this.dynamic = dynamic;
    this.emitChanges();
  }

  onExpressionChange(expression: string): void {
    this.expression = expression;
    this.emitChanges();
  }

  protected abstract defaultConstantValue(): T;
  protected abstract convertValueToExpression(value?: T): string;
  protected abstract convertExpressionToValue(expression: string): T;

  protected emitChanges(): void {
    const dynamicValue: D = this.originalValue ? { ...this.originalValue } : ({} as D);
    if (this.value !== undefined) {
      dynamicValue.value = this.value;
    }
    if (this.dynamic !== undefined) {
      dynamicValue.dynamic = this.dynamic;
    }
    if (this.expression !== undefined) {
      dynamicValue.expression = this.expression;
    }
    this.originalValue = dynamicValue;
    this.onChange?.(dynamicValue);
  }
}
