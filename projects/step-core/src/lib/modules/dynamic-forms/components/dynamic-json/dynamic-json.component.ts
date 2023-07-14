import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { DynamicValueString } from '../../../../client/step-client-module';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DynamicFieldsSchema } from '../../shared/dynamic-fields-schema';

type OnChange = (value: DynamicValueString) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-dynamic-json',
  templateUrl: './dynamic-json.component.html',
  styleUrls: ['./dynamic-json.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicJsonComponent implements ControlValueAccessor {
  @Input() primaryFieldsLabel?: string;
  @Input() optionalFieldsLabel?: string;
  @Input() primaryFieldsDescription?: string;
  @Input() optionalFieldsDescription?: string;
  @Input() addFieldBtnLabel?: string;
  @Input() jsonFieldsLabel?: string;
  @Input() schema?: DynamicFieldsSchema;

  @Input() label?: string;
  @Input() showRequiredAsterisk: boolean = false;
  @Output() blur = new EventEmitter<void>();

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  private originalValue?: DynamicValueString;

  value: string = '';
  dynamic: boolean = false;
  expression: string = '';
  isDisabled: boolean = false;

  constructor(public _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  writeValue(dynamicValueString?: DynamicValueString): void {
    this.originalValue = dynamicValueString;
    this.value = dynamicValueString?.value ?? '{}';
    this.dynamic = dynamicValueString?.dynamic ?? false;
    this.expression = dynamicValueString?.expression ?? '';
  }

  registerOnChange(fn: OnChange): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onValueChange(value?: string): void {
    this.value = value ?? '{}';
    this.emitChanges();
  }

  toggleDynamicExpression(dynamic: boolean): void {
    if (dynamic) {
      this.expression = this.value ? this.value.toString() : '';
      this.value = '';
    } else {
      this.value = this.expression;
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
    const dynamicValue: DynamicValueString = this.originalValue ? { ...this.originalValue } : {};
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
