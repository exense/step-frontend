import { Component, EventEmitter, inject, Input, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { AceMode, RichEditorDialogService } from '../../../rich-editor';

type OnChange = (expression?: string) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-expression-input',
  templateUrl: './expression-input.component.html',
  styleUrls: ['./expression-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ExpressionInputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() tooltip?: string;
  @Input() placeholder?: string;
  @Input() isParentInvalid?: boolean;
  @Input() isParentTouched?: boolean;
  @Input() isParentDisabled?: boolean;
  @Input() showRequiredMarker?: boolean;

  @Output() toggleConstantValue = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();

  private _richEditorDialogs = inject(RichEditorDialogService);

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected expression: string = '';
  protected isDisabled: boolean = false;

  constructor(readonly _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  writeValue(expression?: string): void {
    this.expression = expression ?? '';
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

  protected onExpressionChange(expression: string): void {
    this.expression = expression;
    this.onChange?.(expression);
  }

  protected onBlur(): void {
    this.onTouch?.();
    this.blur.emit();
  }

  protected editDynamicExpression(): void {
    this._richEditorDialogs
      .editText(this.expression, { predefinedMode: AceMode.GROOVY, title: 'Free text editor' })
      .subscribe((expression) => {
        this.expression = expression;
        this.onChange?.(expression);
      });
  }
}
