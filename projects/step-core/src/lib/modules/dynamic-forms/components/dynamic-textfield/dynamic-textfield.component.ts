import { Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DynamicValueString } from '../../../../client/step-client-module';
import { DialogsService, dynamicValueFactory } from '../../../../shared';

type OnChange = (dynamicValueString?: DynamicValueString) => void;
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

  private _dialogsService = inject(DialogsService);

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected value: string = '';
  protected dynamic: boolean = false;
  protected expression: string = '';
  protected isDisabled: boolean = false;

  constructor(readonly _ngControl: NgControl) {
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

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  protected onValueChange(value: string): void {
    this.value = value;
    this.emitChanges();
  }

  protected onBlur(): void {
    this.onTouch?.();
  }

  protected editConstantValue(): void {
    this._dialogsService.enterValue('Free text editor', this.value, 'lg', 'enterTextValueDialog', (value) => {
      this.value = value;
      this.emitChanges();
    });
  }

  protected toggleDynamicExpression(dynamic: boolean): void {
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

  protected onExpressionChange(expression: string): void {
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
