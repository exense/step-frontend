import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '../../../../client/generated';
import { AJS_MODULE } from '../../../../shared';
import { DynamicFieldGroupValue } from '../../shared/dynamic-field-group-value';
import { DynamicFieldsSchema } from '../../shared/dynamic-fields-schema';

@Component({
  selector: 'step-dynamic-field-editor',
  templateUrl: './dynamic-field-editor.component.html',
  styleUrls: ['./dynamic-field-editor.component.scss'],
})
export class DynamicFieldEditorComponent implements OnChanges {
  @Input() isDisabled?: boolean;
  @Input() schema?: DynamicFieldsSchema;
  @Input() value?: string;

  @Output() valueChange = new EventEmitter<string | undefined>();

  protected showJson: boolean = false;
  protected internalValue?: DynamicFieldGroupValue;

  ngOnChanges(changes: SimpleChanges): void {
    const cValue = changes['value'];

    if (cValue?.previousValue !== cValue?.currentValue || cValue?.firstChange) {
      this.parseValue(cValue?.currentValue);
    }
  }

  handleChange(value?: DynamicFieldGroupValue): void {
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
    if (typeof value !== 'string' && !this.schema?.properties) {
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

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepDynamicFieldEditor', downgradeComponent({ component: DynamicFieldEditorComponent }));
