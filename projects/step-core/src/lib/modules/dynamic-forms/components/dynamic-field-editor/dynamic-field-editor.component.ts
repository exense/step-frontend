import { Component, computed, EventEmitter, input, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '../../../../client/generated';
import { DynamicFieldObjectValue } from '../../shared/dynamic-field-group-value';
import { DynamicFieldsSchema, SchemaObjectField } from '../../shared/dynamic-fields-schema';

@Component({
  selector: 'step-dynamic-field-editor',
  templateUrl: './dynamic-field-editor.component.html',
  styleUrls: ['./dynamic-field-editor.component.scss'],
})
export class DynamicFieldEditorComponent implements OnChanges {
  @Input() isDisabled?: boolean;

  /** @Input() **/
  readonly dynamicSchema = input<DynamicFieldsSchema | undefined>(undefined, { alias: 'schema' });
  protected schema = computed(() => {
    const dynamicSchema = this.dynamicSchema();
    if (!dynamicSchema) {
      return undefined;
    }
    return { ...dynamicSchema, type: 'object' } as SchemaObjectField;
  });

  @Input() value?: string;

  @Input() primaryFieldsLabel?: string;
  @Input() optionalFieldsLabel?: string;
  @Input() addFieldBtnLabel?: string;
  @Input() jsonFieldsLabel?: string;

  @Output() valueChange = new EventEmitter<string | undefined>();
  @Output() blur = new EventEmitter<void>();

  protected showJson: boolean = false;
  protected internalValue?: DynamicFieldObjectValue;

  ngOnChanges(changes: SimpleChanges): void {
    const cValue = changes['value'];
    if (cValue?.previousValue !== cValue?.currentValue || cValue?.firstChange) {
      this.parseValue(cValue?.currentValue);
    }
  }

  handleChange(value?: DynamicFieldObjectValue): void {
    this.internalValue = value;

    if (value) {
      Object.keys(value)
        .filter((key) => typeof value[key] !== 'object')
        .forEach((key) => {
          value[key] = this.convertToValueType(value[key]);
        });
    }

    this.valueChange.emit(!value ? '' : JSON.stringify(value));
  }

  private convertToValueType(value: any): DynamicValueInteger | DynamicValueBoolean | DynamicValueString {
    if (typeof value !== 'string' && !this.schema()?.properties) {
      return {
        expression: value.toString(),
        dynamic: true,
      } as DynamicValueString;
    }

    const dynamicValue = {
      value: value,
      dynamic: false,
    };

    switch (typeof value) {
      case 'number':
        return dynamicValue as DynamicValueInteger;
      case 'boolean':
        return dynamicValue as DynamicValueBoolean;
      default:
        return dynamicValue as DynamicValueString;
    }
  }

  private parseValue(value?: string): void {
    value = value || this.value;

    if (!value) {
      this.internalValue = undefined;
      return;
    }

    try {
      this.internalValue = JSON.parse(value);
    } catch (e) {
      // do nothing
    }
  }
}
