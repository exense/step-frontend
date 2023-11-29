import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { NgControl } from '@angular/forms';
import { DynamicValueInteger, DynamicValueString } from '../../../../client/step-client-module';
import { DialogsService } from '../../../../shared';
import { DynamicValueBaseComponent } from '../dynamic-value-base/dynamic-value-base.component';

const NUMBER_RESTRICTION_POSITIVE_ONLY = ['+', '-', 'e'];
const NUMBER_RESTRICTION_WITH_NEGATIVE = ['+', 'e'];

@Component({
  selector: 'step-dynamic-textfield',
  templateUrl: './dynamic-textfield.component.html',
  styleUrls: ['./dynamic-textfield.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicTextfieldComponent
  extends DynamicValueBaseComponent<DynamicValueString | DynamicValueInteger>
  implements OnChanges
{
  @Input() isNumber = false;
  @Input() isNegativeNumberAllowed = false;

  protected numberInputInvalidChars = NUMBER_RESTRICTION_POSITIVE_ONLY;

  constructor(private _dialogsService: DialogsService, _ngControl: NgControl) {
    super(_ngControl);
  }

  protected override defaultConstantValue(): string | number {
    return '';
  }
  protected override convertValueToExpression(value?: string | number): string {
    if (value) {
      return value.toString();
    }
    return '';
  }
  protected override convertExpressionToValue(expression: string): string | number {
    return this.parseValue(expression);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cIsNegativeNumberAllowed = changes['isNegativeNumberAllowed'];
    if (
      cIsNegativeNumberAllowed?.previousValue !== cIsNegativeNumberAllowed?.currentValue ||
      cIsNegativeNumberAllowed?.firstChange
    ) {
      this.numberInputInvalidChars = cIsNegativeNumberAllowed?.currentValue
        ? NUMBER_RESTRICTION_WITH_NEGATIVE
        : NUMBER_RESTRICTION_POSITIVE_ONLY;
    }
  }

  editConstantValue(): void {
    this._dialogsService.enterValue('Free text editor', this.value.toString(), true).subscribe((value) => {
      this.value = this.parseValue(value);
      this.emitChanges();
    });
  }

  private parseValue(value: string): string | number {
    if (this.isNumber) {
      let numValue = parseFloat(value);
      numValue = isNaN(numValue) ? 0 : numValue;
      return numValue;
    } else {
      return value;
    }
  }
}
