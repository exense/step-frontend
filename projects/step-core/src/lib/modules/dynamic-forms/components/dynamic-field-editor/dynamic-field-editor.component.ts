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
    this.valueChange.emit(!value ? '' : JSON.stringify(value));
  }

  private parseValue(value?: string): void {
    value = value || this.value;

    if (!value) {
      this.internalValue = undefined;
      return;
    }

    try {
      this.internalValue = JSON.parse(value);

      if (!this.internalValue) {
        return;
      }

      Object.keys(this.internalValue).forEach((key) => {
        this.normalizeDynamicValue(this.internalValue![key]);
      });
    } catch (e) {
      // do nothing
    }
  }

  private normalizeDynamicValue<T extends DynamicValueString | DynamicValueBoolean | DynamicValueInteger>(
    dynamicValue: T
  ): void {
    const isBoolean = (value: unknown) => typeof value === 'boolean' || value === 'true' || value === 'false';
    const isNumber = (value: unknown) => typeof value === 'number' || !isNaN(Number(value));

    const { value } = dynamicValue;
    const valueIsBoolean = isBoolean(value);
    const valueIsNumber = isNumber(value);

    if (valueIsBoolean) {
      dynamicValue.value = value === 'true' ? true : false;
    } else if (valueIsNumber) {
      dynamicValue.value = Number(value);
    }
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepDynamicFieldEditor', downgradeComponent({ component: DynamicFieldEditorComponent }));
