import { computed, Directive, effect, inject, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DynamicValue } from '../../../../client/augmented/models/dynamic-value-complex-types';
import { AceMode, RichEditorDialogService } from '../../../rich-editor';
import { DynamicFieldType } from '../../shared/dynamic-field-type';

type OnChange<T extends DynamicValue> = (dynamicValue?: T) => void;
type OnTouch = () => void;

const SIMPLE_TYPES = new Set(['string', 'number', 'boolean']);

@Directive()
export abstract class DynamicFieldBaseComponent<T extends DynamicValue> implements ControlValueAccessor {
  private _richEditorDialogs = inject(RichEditorDialogService);

  private onChange?: OnChange<T>;
  private onTouch?: OnTouch;

  /** @Input() **/
  readonly tabIndex = input<number | undefined>();

  /** @Input() **/
  readonly hasLabel = input(true);

  /** @Input() **/
  readonly canEditLabel = input(false, {
    transform: (value: boolean | undefined) => value ?? false,
  });

  /** @Input() **/
  readonly tooltip = input<string | undefined>();

  /** @Input() **/
  readonly label = input<string | undefined>();

  /** @Output() **/
  readonly labelChange = output<string | undefined>();

  protected labelModel = model<string | undefined>();

  private effSyncLabel = effect(
    () => {
      const inputLabel = this.label();
      this.labelModel.set(inputLabel);
    },
    { allowSignalWrites: true },
  );

  /** @Input() **/
  readonly fieldType = input(DynamicFieldType.STRING);

  /** @Input() **/
  readonly canRemove = input(false, {
    transform: (value?: boolean) => value ?? false,
  });

  /** @Output() **/
  readonly remove = output();

  /** @Input() **/
  readonly elementRefMapKey = input<string | undefined>();

  protected forceFocus = signal(false);
  readonly isDisabled = signal(false);
  protected internalValue = signal<T | undefined>(undefined);

  readonly value = computed(() => this.internalValue()?.value);
  protected expression = computed(() => this.internalValue()?.expression);
  protected dynamic = computed(() => this.internalValue()?.dynamic);

  protected constructor(public readonly _ngControl?: NgControl) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  registerOnChange(onChange: OnChange<T>): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch: OnTouch): void {
    this.onTouch = onTouch;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  writeValue(value?: T): void {
    this.internalValue.set(value);
  }

  handleBlur(): void {
    this.onTouch?.();
  }

  handleValueChange(value: T['value']): void {
    const internalValue = { ...this.internalValue(), value } as T;
    this.internalValue.set(internalValue);
    this.onChange?.(internalValue);
  }

  handleExpressionChange(expression: string): void {
    const internalValue = { ...this.internalValue(), expression } as T;
    this.internalValue.set(internalValue);
    this.onChange?.(internalValue);
  }

  toggleDynamic(): void {
    const dynamic = !this.dynamic();

    let expression = '';
    let value: T['value'] | undefined = '';

    if (dynamic) {
      expression = this.valueToString(this.value()).valueStr;
    } else {
      value = this.parseValue(this.expression());
    }

    const internalValue = { ...this.internalValue(), value, expression, dynamic } as T;
    this.internalValue.set(internalValue);
    this.onChange?.(internalValue);
  }

  editValueInModal(predefinedMode?: AceMode): void {
    const value = this.value();
    const { valueStr, isComplexType } = this.valueToString(value);

    this._richEditorDialogs.editText(valueStr, { predefinedMode }).subscribe((result) => {
      if (result && isComplexType) {
        result = JSON.parse(result);
      }
      this.handleValueChange(result);
    });
  }

  editExpressionInModal(): void {
    const text = this.expression() ?? '';
    this._richEditorDialogs.editText(text, { predefinedMode: AceMode.GROOVY }).subscribe((expression) => {
      this.handleExpressionChange(expression);
    });
  }

  protected fixLabelFocus($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
  }

  private valueToString(value?: T['value']): { valueStr: string; isComplexType: boolean } {
    const valueType = typeof value;
    let valueStr = '';
    let isComplexType = false;

    if (!value) {
      valueStr = '';
    } else if (SIMPLE_TYPES.has(valueType)) {
      valueStr = value.toString();
    } else {
      isComplexType = true;
      valueStr = JSON.stringify(value, undefined, 2);
    }
    return { valueStr, isComplexType };
  }

  private parseValue(valueStr?: string): T['value'] | undefined {
    const fieldType = this.fieldType();
    if (!valueStr) {
      return undefined;
    }
    if (fieldType === DynamicFieldType.OBJECT || fieldType === DynamicFieldType.ARRAY) {
      try {
        return JSON.parse(valueStr) as T['value'];
      } catch {
        return undefined;
      }
    }
    return valueStr as T['value'];
  }
}
