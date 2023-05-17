import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DynamicValueString } from '../../client/generated';
import { dynamicValueFactory } from '../../shared';

type OnChange = (dynamicValueString: DynamicValueString) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-dynamic-resource-input',
  templateUrl: './dynamic-resource-input.component.html',
  styleUrls: ['./dynamic-resource-input.component.scss'],
})
export class DynamicResourceInputComponent implements ControlValueAccessor {
  @Input() label!: string;
  @Input() type!: string;
  @Input() directory?: boolean;
  @Input() tooltip?: string;
  @Input() showRequiredAsterisk?: boolean;

  @Output() save = new EventEmitter<void>();

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  value: string = '';
  dynamic: boolean = false;
  expression: string = '';

  constructor(protected _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  writeValue(dynamicValueString?: DynamicValueString): void {
    this.value = dynamicValueString?.value || '';
    this.dynamic = dynamicValueString?.dynamic || false;
    this.expression = dynamicValueString?.expression || '';
  }

  registerOnChange(onChange: OnChange): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch: OnTouch): void {
    this.onTouch = onTouch;
  }

  onBlur(): void {
    this.onTouch?.();
  }

  toggleDynamicExpression(dynamic: boolean): void {
    if (dynamic) {
      this.expression = this.value;
      this.value = '';
    } else {
      this.value = this.expression;
      this.expression = '';
    }

    this.dynamic = dynamic;
    this.emitChanges();
  }

  onValueChange(value: string): void {
    this.value = value;
    this.emitChanges();
  }

  onExpressionChange(expression: string): void {
    this.expression = expression;
    this.emitChanges();
  }

  private toDynamicValueString(): DynamicValueString {
    const { createDynamicValueString } = dynamicValueFactory();

    return {
      ...createDynamicValueString(),
      ...(this.value ? { value: this.value } : {}),
      ...(this.dynamic ? { dynamic: this.dynamic } : {}),
      ...(this.expression ? { expression: this.expression } : {}),
    };
  }

  private emitChanges(): void {
    this.onChange?.(this.toDynamicValueString());
  }
}
