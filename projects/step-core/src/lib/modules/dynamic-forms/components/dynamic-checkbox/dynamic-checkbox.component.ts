import { Component, inject, ViewEncapsulation } from '@angular/core';
import { DynamicValueBoolean } from '../../../../client/step-client-module';
import { NgControl } from '@angular/forms';
import { DynamicValueBaseComponent } from '../dynamic-value-base/dynamic-value-base.component';
import { DYNAMIC_EXPRESSION_TOGGLE_TOOLTIP } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-dynamic-checkbox',
  templateUrl: './dynamic-checkbox.component.html',
  styleUrls: ['./dynamic-checkbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class DynamicCheckboxComponent extends DynamicValueBaseComponent<DynamicValueBoolean> {
  protected readonly _toggleTooltip = inject(DYNAMIC_EXPRESSION_TOGGLE_TOOLTIP);

  constructor(_ngControl: NgControl) {
    super(_ngControl);
  }
  protected override defaultConstantValue(): boolean {
    return false;
  }
  protected override convertValueToExpression(value?: boolean): string {
    if (value !== undefined) {
      return value.toString();
    }
    return '';
  }
  protected override convertExpressionToValue(expression: string): boolean {
    return expression.toLowerCase() === 'true';
  }
}
