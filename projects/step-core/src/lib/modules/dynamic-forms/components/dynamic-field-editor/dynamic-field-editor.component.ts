import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DynamicFieldsSchema } from '../../shared/dynamic-fields-schema';
import { DynamicFieldGroupValue } from '../../shared/dynamic-field-group-value';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../../../../shared';

@Component({
  selector: 'step-dynamic-field-editor',
  templateUrl: './dynamic-field-editor.component.html',
  styleUrls: ['./dynamic-field-editor.component.scss'],
})
export class DynamicFieldEditorComponent implements OnChanges {
  protected showJson: boolean = false;
  protected internalValue?: DynamicFieldGroupValue;
  @Input() isDisabled?: boolean;
  @Input() schema?: DynamicFieldsSchema;
  @Input() value?: string;
  @Output() valueChange = new EventEmitter<string | undefined>();

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
    let internalValue: DynamicFieldGroupValue | undefined = undefined;
    try {
      internalValue = JSON.parse(value);
    } catch (e) {}
    this.internalValue = internalValue;
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepDynamicFieldEditor', downgradeComponent({ component: DynamicFieldEditorComponent }));
