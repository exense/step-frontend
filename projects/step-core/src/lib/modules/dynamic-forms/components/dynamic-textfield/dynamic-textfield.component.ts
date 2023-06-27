import { Component, inject, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DynamicValueInteger, DynamicValueString } from '../../../../client/step-client-module';
import { DialogsService, dynamicValueFactory } from '../../../../shared';

type OnChange = (dynamicValueString: DynamicValueString | DynamicValueInteger) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-dynamic-textfield',
  templateUrl: './dynamic-textfield.component.html',
  styleUrls: ['./dynamic-textfield.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicTextfieldComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() tooltip?: string;
  @Input() showRequiredMarker: boolean = false;
  @Input() isNumber: boolean = false;
  @Output() blur = new EventEmitter<void>();

  private _dialogsService = inject(DialogsService);

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected value: string | number = '';
  protected dynamic: boolean = false;
  protected expression: string = '';
  protected isDisabled: boolean = false;

  readonly numberInputInvalidChars = ['+', '-', 'e'];

  constructor(readonly _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  writeValue(dynamicValueString: DynamicValueString | DynamicValueInteger | null): void {
    this.value = dynamicValueString?.value ?? (this.isNumber ? 0 : '');
    this.dynamic = dynamicValueString?.dynamic || false;
    this.expression = dynamicValueString?.expression || '';
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

  onValueChange(value: string | number): void {
    this.value = value;
    this.emitChanges();
  }

  protected onBlur(): void {
    this.onTouch?.();
    this.blur.emit();
  }

  protected editConstantValue(): void {
    this._dialogsService.enterValue(
      'Free text editor',
      this.value.toString(),
      'lg',
      'enterTextValueDialog',
      (value) => {
        this.value = this.parseValue(value);
        this.emitChanges();
      }
    );
  }

  protected toggleDynamicExpression(dynamic: boolean): void {
    if (dynamic) {
      this.expression = this.value.toString();
      this.value = '';
    } else {
      this.value = this.parseValue(this.expression);
      this.expression = '';
    }

    this.dynamic = dynamic;
    this.emitChanges();
  }

  protected onExpressionChange(expression: string): void {
    this.expression = expression;
    this.emitChanges();
  }

  private toDynamicValueString(): DynamicValueString | DynamicValueInteger {
    const { createDynamicValueString } = dynamicValueFactory();

    return {
      ...createDynamicValueString(),
      ...(this.value ? { value: this.value } : {}),
      ...(this.dynamic ? { dynamic: this.dynamic } : {}),
      ...(this.expression ? { expression: this.expression } : {}),
    } as DynamicValueString | DynamicValueInteger;
  }

  private emitChanges(): void {
    this.onChange?.(this.toDynamicValueString());
  }

  private parseValue(value: string): string | number {
    if (this.isNumber) {
      let numValue = parseFloat(value);
      numValue = isNaN(numValue) ? 0 : numValue;
      return numValue;
    } else {
      return value;
    }
  }
}
