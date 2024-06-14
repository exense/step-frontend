import {
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  OnDestroy,
  Optional,
  Output,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DynamicFieldType } from '../../shared/dynamic-field-type';
import { AceMode, RichEditorDialogService } from '../../../rich-editor';
import { DynamicValue } from '../../../../client/step-client-module';
import { SchemaField, SchemaObjectField } from '../../shared/dynamic-fields-schema';
import { ComplexFieldContext, ComplexFieldContextService } from '../../services/complex-field-context.service';

type OnChange = (dynamicValue?: DynamicValue) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-dynamic-field',
  templateUrl: './dynamic-field.component.html',
  styleUrls: ['./dynamic-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicFieldComponent implements ControlValueAccessor, ComplexFieldContextService, OnDestroy {
  private _richEditorDialogs = inject(RichEditorDialogService);
  protected complexFieldContext?: ComplexFieldContextService = this as ComplexFieldContextService;

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  private internalValue?: DynamicValue;

  isDisabled = false;

  value: DynamicValue['value'];

  protected expression: string = '';

  protected dynamic: boolean = false;

  protected displayEnumExtraValue: boolean = false;

  protected forceFocus: boolean = false;

  readonly DynamicFieldType = DynamicFieldType;
  readonly AceMode = AceMode;

  @Input() tabIndex?: number;
  @Input() label?: string = '';
  @Output() labelChange = new EventEmitter<string>();

  @Input() canEditLabel?: boolean = false;

  @Input() tooltip?: string = '';

  @Input() fieldType: DynamicFieldType = DynamicFieldType.STRING;
  @Input() fieldSchema?: SchemaField;
  @Input() fieldObjectTemplate?: TemplateRef<ComplexFieldContext>;

  @Input() canRemove?: boolean = false;

  @Output() remove = new EventEmitter<void>();

  @Input() enumItems?: string[] = [];

  @Input() elementRefMapKey?: string;

  constructor(@Optional() public _ngControl?: NgControl) {
    if (this._ngControl) {
      this._ngControl.valueAccessor = this;
    }
  }

  ngOnDestroy(): void {
    this.complexFieldContext = undefined;
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

  editValueInModal(predefinedMode?: AceMode): void {
    const text = this.value?.toString() ?? '';
    this._richEditorDialogs.editText(text, { predefinedMode }).subscribe((value) => {
      this.valueChange(value);
    });
  }

  editExpressionInModal(): void {
    const text = this.expression ?? '';
    this._richEditorDialogs.editText(text, { predefinedMode: AceMode.GROOVY }).subscribe((expression) => {
      this.expressionChange(expression);
    });
  }

  handleBlur(): void {
    this.onTouch?.();
  }

  protected fixLabelFocus($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
  }

  valueChange(value: DynamicValue['value'], type?: DynamicFieldType): void {
    if (type === DynamicFieldType.ARRAY && typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // we don't show the error since they may happen for in-between states when typing an object
        return;
      }
    }

    this.value = value;
    this.internalValue = { ...this.internalValue, value };
    this.onChange?.(this.internalValue);
    this.determineEnumExtraValueFlag();
  }

  protected expressionChange(expression: string): void {
    this.expression = expression;
    this.internalValue = { ...this.internalValue, expression };
    this.onChange?.(this.internalValue);
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
    this.onChange?.(this.internalValue);
    this.synchronizeInternalValueWithFields();
  }

  private synchronizeInternalValueWithFields(): void {
    this.value = this.internalValue?.value;
    this.expression = this.internalValue?.expression || '';
    this.dynamic = this.internalValue?.dynamic || false;
    this.determineEnumExtraValueFlag();
  }

  private determineEnumExtraValueFlag(): void {
    if (this.fieldType !== DynamicFieldType.ENUM) {
      this.displayEnumExtraValue = false;
      return;
    }

    this.displayEnumExtraValue = !(this.enumItems || []).includes(this.value ? this.value.toString() : '');
  }
}
