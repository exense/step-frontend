import { Component, EventEmitter, Input, OnDestroy, Optional, Output } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DynamicValueString } from '../../../../client/generated';
import { noop } from 'rxjs';
import { DynamicFieldType } from '../../shared/dynamic-field-type';
import { DialogsService } from '../../../../shared';

type OnChange = (dynamicValueString?: DynamicValueString) => void;
type OnTouch = () => void;

const DEFAULT_VALUE: DynamicValueString = {
  value: '',
  expression: '',
  dynamic: false,
};

@Component({
  selector: 'step-dynamic-field',
  templateUrl: './dynamic-field.component.html',
  styleUrls: ['./dynamic-field.component.scss'],
})
export class DynamicFieldComponent implements ControlValueAccessor, OnDestroy {
  private onChange: OnChange = noop;
  protected onTouch: OnTouch = noop;

  private internalValue: DynamicValueString = { ...DEFAULT_VALUE };

  protected isDisabled = false;

  protected value: string = '';

  protected expression: string = '';

  protected dynamic: boolean = false;

  protected displayEnumExtraValue: boolean = false;

  protected forceFocus: boolean = false;

  readonly DynamicFieldType = DynamicFieldType;

  @Input() tabIndex?: number;
  @Input() label?: string = '';
  @Output() labelChange = new EventEmitter<string>();

  @Input() canEditLabel?: boolean = false;

  @Input() tooltip?: string = '';

  @Input() fieldType: DynamicFieldType = DynamicFieldType.string;

  @Input() canRemove?: boolean = false;

  @Output() remove = new EventEmitter<void>();

  @Input() enumItems?: string[] = [];

  constructor(private _dialogService: DialogsService, @Optional() public _ngControl?: NgControl) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
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

  writeValue(value?: DynamicValueString): void {
    this.internalValue = { ...DEFAULT_VALUE, ...(value || {}) };
    this.synchronizeInternalValueWithFields();
  }

  ngOnDestroy(): void {
    this.onChange = noop;
    this.onTouch = noop;
  }

  editStringValueInModal(): void {
    this._dialogService.enterValue('Free text editor', this.value, 'lg', 'enterTextValueDialog', (value) =>
      this.valueChange(value)
    );
  }

  protected fixLabelFocus($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
  }

  protected valueChange(value: string): void {
    value = value.toString();
    this.value = value;
    this.internalValue = { ...this.internalValue, value };
    this.onChange(this.internalValue);
    this.determineEnumExtraValueFlag();
  }

  protected expressionChange(expression: string): void {
    this.expression = expression;
    this.internalValue = { ...this.internalValue, expression };
    this.onChange(this.internalValue);
  }

  protected toggleDynamic(): void {
    const dynamic = !this.dynamic;

    let expression = '';
    let value = '';

    if (dynamic) {
      expression = this.value.toString();
    } else {
      value = this.parseValue(this.expression);
    }

    this.internalValue = { value, expression, dynamic };
    this.onChange(this.internalValue);
    this.synchronizeInternalValueWithFields();
  }

  private synchronizeInternalValueWithFields(): void {
    this.value = this.parseValue(this.internalValue.value || '');
    this.expression = this.internalValue.expression || '';
    this.dynamic = this.internalValue.dynamic || false;
    this.determineEnumExtraValueFlag();
  }

  private determineEnumExtraValueFlag(): void {
    if (this.fieldType !== DynamicFieldType.enum) {
      this.displayEnumExtraValue = false;
      return;
    }
    this.displayEnumExtraValue = !(this.enumItems || []).includes(this.value);
  }

  private parseValue(value: string): string {
    if (!value) {
      return '';
    }
    switch (this.fieldType) {
      case DynamicFieldType.boolean:
        const valueTrimmed = value.trim().toLowerCase();
        return ['true', 'false'].includes(valueTrimmed) ? valueTrimmed : '';
      case DynamicFieldType.number:
        const num = parseFloat(value);
        return isNaN(num) ? '' : num.toString();
      default:
        return value;
    }
  }
}
