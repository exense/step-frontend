import { Component, input, ViewEncapsulation } from '@angular/core';
import { DynamicValueString } from '../../../../client/step-client-module';
import { NgControl } from '@angular/forms';
import { DynamicValueBaseComponent } from '../dynamic-value-base/dynamic-value-base.component';

@Component({
  selector: 'step-dynamic-resource',
  templateUrl: './dynamic-resource.component.html',
  styleUrls: ['./dynamic-resource.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicResourceComponent extends DynamicValueBaseComponent<DynamicValueString> {
  readonly type = input.required<string>();
  readonly supportsDirectory = input(false);

  constructor(_ngControl: NgControl) {
    super(_ngControl);
  }

  protected override defaultConstantValue(): string {
    return '';
  }
  protected override convertValueToExpression(value?: string): string {
    return value ?? '';
  }
  protected convertExpressionToValue(expression: string): string {
    return expression;
  }
}
