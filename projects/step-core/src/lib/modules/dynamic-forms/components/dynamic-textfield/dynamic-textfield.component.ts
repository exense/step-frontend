import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DynamicValueInteger, DynamicValueString } from '../../../../client/step-client-module';
import { DialogsService } from '../../../../shared';

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
  @Input() showRequiredAsterisk: boolean = false;
  @Input() isNumber: boolean = false;
  @Output() blur = new EventEmitter<void>();

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  value: string | number = '';
  dynamic: boolean = false;
  expression: string = '';
  isDisabled: boolean = false;

  constructor(private _dialogsService: DialogsService, public _ngControl: NgControl) {
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

  preventNumberInvalidChars(event: KeyboardEvent): void {
    const numberInputInvalidCharts = ['+', '-', 'e'];
    if (numberInputInvalidCharts.includes(event.key)) {
      event.preventDefault();
    }
  }

  onBlur(): void {
    this.onTouch?.();
    this.blur.emit();
  }

  editConstantValue(): void {
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

  toggleDynamicExpression(dynamic: boolean): void {
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

  onExpressionChange(expression: string): void {
    this.expression = expression;
    this.emitChanges();
  }

  private toDynamicValueString(): DynamicValueString | DynamicValueInteger {
    return {
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
