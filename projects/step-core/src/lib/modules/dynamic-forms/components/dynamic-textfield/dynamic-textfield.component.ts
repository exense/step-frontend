import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NgControl } from '@angular/forms';
import { DynamicValueInteger, DynamicValueString } from '../../../../client/step-client-module';
import { DialogsService } from '../../../../shared';
import { DynamicValueBaseComponent } from '../dynamic-value-base/dynamic-value-base.component';

@Component({
  selector: 'step-dynamic-textfield',
  templateUrl: './dynamic-textfield.component.html',
  styleUrls: ['./dynamic-textfield.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicTextfieldComponent extends DynamicValueBaseComponent<DynamicValueString | DynamicValueInteger> {
  @Input() isNumber: boolean = false;

  readonly numberInputInvalidChars = ['+', '-', 'e'];

  constructor(private _dialogsService: DialogsService, _ngControl: NgControl) {
    super(_ngControl);
  }

  protected override defaultConstantValue(): string | number {
    return this.isNumber ? 0 : '';
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

  editConstantValue(): void {
    this._dialogsService.enterValue(
      'Free text editor',
      this.value.toString(),
      'lg',
      'enterTextValueDialog',
      (value) => {
        this.value = this.parseValue(value);
        this.emitChanges();
      }
    );
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
