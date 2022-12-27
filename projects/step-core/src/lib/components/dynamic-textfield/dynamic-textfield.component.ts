import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NgControl } from '@angular/forms';
import { DynamicValueString } from '../../client/step-client-module';
import { DialogsService } from '../../shared';

type OnChange = (dynamicValueString: DynamicValueString) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-dynamic-textfield',
  templateUrl: './dynamic-textfield.component.html',
  styleUrls: ['./dynamic-textfield.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicTextfieldComponent {
  @Input() label?: string;
  @Input() tooltip?: string;
  @Input() showRequiredAsterisk: boolean = false;

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  value: string = '';
  dynamic: boolean = false;
  expression: string = '';

  constructor(private _dialogsService: DialogsService, public _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  writeValue(dynamicValueString: DynamicValueString | null): void {
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

  onValueChange(value: string): void {
    this.value = value;
    this.emitChanges();
  }

  onBlur(): void {
    this.onTouch?.();
  }

  editConstantValue(): void {
    this._dialogsService.enterValue('Free text editor', this.value, 'lg', 'enterTextValueDialog', (value) => {
      this.value = value;
      this.emitChanges();
    });
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

  onExpressionChange(expression: string): void {
    this.expression = expression;
    this.emitChanges();
  }

  private toDynamicValueString(): DynamicValueString {
    return {
      ...(this.value ? { value: this.value } : {}),
      ...(this.dynamic ? { dynamic: this.dynamic } : {}),
      ...(this.expression ? { expression: this.expression } : {}),
    };
  }

  private emitChanges(): void {
    this.onChange?.(this.toDynamicValueString());
  }
}
