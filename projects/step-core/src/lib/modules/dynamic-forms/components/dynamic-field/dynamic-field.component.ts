import { Component, EventEmitter, Input, OnDestroy, Optional, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '../../../../client/generated';
import { DialogsService } from '../../../../shared';
import { DynamicFieldType } from '../../shared/dynamic-field-type';

type DynamicValue = DynamicValueString | DynamicValueBoolean | DynamicValueInteger;

type OnChange = (dynamicValue?: DynamicValue) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-dynamic-field',
  templateUrl: './dynamic-field.component.html',
  styleUrls: ['./dynamic-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicFieldComponent implements ControlValueAccessor, OnDestroy {
  private onChange: OnChange = noop;
  protected onTouch: OnTouch = noop;

  private internalValue?: DynamicValue;

  protected isDisabled = false;

  protected value: DynamicValue['value'];

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

  @Input() elementRefMapKey?: string;

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

  writeValue(value?: DynamicValue): void {
    this.internalValue = value;
    this.synchronizeInternalValueWithFields();
  }

  ngOnDestroy(): void {
    this.onChange = noop;
    this.onTouch = noop;
  }

  editStringValueInModal(): void {
    this._dialogService.enterValue(
      'Free text editor',
      this.value ? this.value.toString() : '',
      'lg',
      'enterTextValueDialog',
      (value) => this.valueChange(value)
    );
  }

  protected fixLabelFocus($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
  }

  protected valueChange(value: DynamicValue['value']): void {
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
      expression = this.value ? this.value.toString() : '';
    } else {
      value = this.expression;
    }

    this.internalValue = { value, expression, dynamic };
    this.onChange(this.internalValue);
    this.synchronizeInternalValueWithFields();
  }

  private synchronizeInternalValueWithFields(): void {
    this.value = this.internalValue?.value;
    this.expression = this.internalValue?.expression || '';
    this.dynamic = this.internalValue?.dynamic || false;
    this.determineEnumExtraValueFlag();
  }

  private determineEnumExtraValueFlag(): void {
    if (this.fieldType !== DynamicFieldType.enum) {
      this.displayEnumExtraValue = false;
      return;
    }

    this.displayEnumExtraValue = !(this.enumItems || []).includes(this.value ? this.value.toString() : '');
  }
}
