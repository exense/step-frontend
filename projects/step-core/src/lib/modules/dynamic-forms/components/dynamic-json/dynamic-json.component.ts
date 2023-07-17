import { Component, Input, ViewEncapsulation } from '@angular/core';
import { DynamicValueString } from '../../../../client/step-client-module';
import { NgControl } from '@angular/forms';
import { DynamicFieldsSchema } from '../../shared/dynamic-fields-schema';
import { DynamicValueBaseComponent } from '../dynamic-value-base/dynamic-value-base.component';

@Component({
  selector: 'step-dynamic-json',
  templateUrl: './dynamic-json.component.html',
  styleUrls: ['./dynamic-json.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicJsonComponent extends DynamicValueBaseComponent<DynamicValueString> {
  @Input() primaryFieldsLabel?: string;
  @Input() optionalFieldsLabel?: string;
  @Input() primaryFieldsDescription?: string;
  @Input() optionalFieldsDescription?: string;
  @Input() addFieldBtnLabel?: string;
  @Input() jsonFieldsLabel?: string;
  @Input() schema?: DynamicFieldsSchema;

  constructor(_ngControl: NgControl) {
    super(_ngControl);
  }

  protected override defaultConstantValue(): string {
    return '{}';
  }
  protected override convertValueToExpression(value?: string): string {
    return value ? value.toString() : '';
  }
  protected override convertExpressionToValue(expression: string): string {
    return expression;
  }
}
