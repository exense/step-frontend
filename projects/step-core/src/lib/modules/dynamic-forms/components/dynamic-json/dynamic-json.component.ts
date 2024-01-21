import { Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';
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
  @Input() enforceGroovyExpression?: boolean;
  @Input() addFieldBtnLabel?: string;
  @Input() jsonFieldsLabel?: string;
  @Input() schema?: DynamicFieldsSchema;

  @HostBinding('class.buttons-visible')
  protected showJson = false;

  constructor(_ngControl: NgControl) {
    super(_ngControl);
  }

  protected override defaultConstantValue(): string {
    return '{}';
  }
  protected override convertValueToExpression(value?: string): string {
    let result = value ? value.toString() : '';
    if (this.enforceGroovyExpression && result) {
      result = `"""${result}"""`;
    }
    return result;
  }
  protected override convertExpressionToValue(expression: string): string {
    let result = expression;
    if (this.enforceGroovyExpression && result) {
      result = result.replace(/^"""/g, '').replace(/"""$/g, '');
    }
    return result;
  }
}
