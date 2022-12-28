import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DialogsService } from '../../shared';

type OnChange = (expression: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-expression-input',
  templateUrl: './expression-input.component.html',
  styleUrls: ['./expression-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ExpressionInputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() tooltip?: string;
  @Input() isParentInvalid: boolean = false;
  @Input() showRequiredAsterisk: boolean = false;

  @Output() toggleConstantValue = new EventEmitter<void>();

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  expression: string = '';

  constructor(private _dialogsService: DialogsService, public _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  writeValue(expression: string | null): void {
    this.expression = expression || '';
  }

  registerOnChange(onChange: OnChange): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch: OnTouch): void {
    this.onTouch = onTouch;
  }

  onExpressionChange(expression: string): void {
    this.expression = expression;
    this.onChange?.(expression);
  }

  onBlur(): void {
    this.onTouch?.();
  }

  editDynamicExpression(): void {
    this._dialogsService.enterValue('Free text editor', this.expression, 'lg', 'enterTextValueDialog', (expression) => {
      this.expression = expression;
      this.onChange?.(expression);
    });
  }
}
