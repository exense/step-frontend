import { NgControl } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DynamicValueBaseComponent } from '../dynamic-value-base/dynamic-value-base.component';
import { DynamicValueInteger } from '../../../../client/step-client-module';
import { TimeUnit, TimeUnitDictionary } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-dynamic-time-input',
  templateUrl: './dynamic-time-input.component.html',
  styleUrls: ['./dynamic-time-input.component.scss'],
})
export class DynamicTimeInputComponent extends DynamicValueBaseComponent<DynamicValueInteger> {
  @Input() allowedMeasures: TimeUnit[] = [
    TimeUnit.MILLISECOND,
    TimeUnit.SECOND,
    TimeUnit.MINUTE,
    TimeUnit.HOUR,
    TimeUnit.DAY,
  ];

  @Input() measuresDictionary?: TimeUnitDictionary;
  @Input() defaultDisplayMeasure?: TimeUnit;
  @Input() displayMeasure?: TimeUnit;
  @Output() displayMeasureChange = new EventEmitter<TimeUnit | undefined>();

  @Input() modelMeasure = TimeUnit.MILLISECOND;

  constructor(_ngControl: NgControl) {
    super(_ngControl);
  }

  protected override defaultConstantValue(): number {
    return 0;
  }

  protected override convertValueToExpression(value?: number): string {
    return value?.toString?.() ?? '';
  }

  protected override convertExpressionToValue(expression: string): number {
    return this.parseValue(expression);
  }

  private parseValue(value: string): number {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
}
