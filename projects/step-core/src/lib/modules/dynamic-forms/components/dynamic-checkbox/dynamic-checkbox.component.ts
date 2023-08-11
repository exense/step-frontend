import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DynamicValueBoolean } from '../../../../client/step-client-module';
import { ControlValueAccessor, NgControl } from '@angular/forms';

type OnChange = (dynamicValueBoolean: DynamicValueBoolean) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-dynamic-checkbox',
  templateUrl: './dynamic-checkbox.component.html',
  styleUrls: ['./dynamic-checkbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicCheckboxComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() tooltip?: string;
  @Input() showRequiredMarker: boolean = false;

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  private originalValue?: DynamicValueBoolean;

  value: boolean = false;
  dynamic: boolean = false;
  expression: string = '';

  isDisabled: boolean = false;

  constructor(public _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  registerOnChange(onChange: OnChange): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch: OnTouch): void {
    this.onTouch = onTouch;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(dynamicValueBoolean?: DynamicValueBoolean): void {
    this.originalValue = dynamicValueBoolean;
    this.value = dynamicValueBoolean?.value ?? false;
    this.dynamic = dynamicValueBoolean?.dynamic ?? false;
    this.expression = dynamicValueBoolean?.expression ?? '';
  }

  onValueChange(value: boolean): void {
    this.value = value;
    this.emitChanges();
  }

  toggleDynamicExpression(dynamic: boolean): void {
    if (dynamic) {
      this.expression = this.value ? this.value.toString() : '';
      this.value = false;
    } else {
      this.value = this.expression.toLowerCase() === 'true';
      this.expression = '';
    }
    this.dynamic = dynamic;
    this.emitChanges();
  }

  onExpressionChange(expression: string): void {
    this.expression = expression;
    this.emitChanges();
  }

  onBlur(): void {
    this.onTouch?.();
  }

  private emitChanges(): void {
    const dynamicValue: DynamicValueBoolean = { ...this.originalValue };
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
