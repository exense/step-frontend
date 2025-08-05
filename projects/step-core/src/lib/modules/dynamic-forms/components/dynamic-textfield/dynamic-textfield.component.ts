import { Component, inject, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { NgControl } from '@angular/forms';
import { DynamicValueInteger, DynamicValueString } from '../../../../client/step-client-module';
import { DynamicValueBaseComponent } from '../dynamic-value-base/dynamic-value-base.component';
import { DialogsService } from '../../../basics/step-basics.module';
import { NUMBER_CHARS_POSITIVE_ONLY, NUMBER_CHARS_WITH_NEGATIVE } from '../../shared/constants';
import { AceMode, RichEditorDialogService } from '../../../rich-editor';

@Component({
  selector: 'step-dynamic-textfield',
  templateUrl: './dynamic-textfield.component.html',
  styleUrl: './dynamic-textfield.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class DynamicTextfieldComponent
  extends DynamicValueBaseComponent<DynamicValueString | DynamicValueInteger>
  implements OnChanges
{
  private _richEditorDialogs = inject(RichEditorDialogService);

  @Input() isNumber = false;
  @Input() isNegativeNumberAllowed = false;
  @Input() predefinedRichEditorMode?: AceMode;
  @Input() allowedRichEditorModes?: AceMode[];

  protected allowedChars = NUMBER_CHARS_POSITIVE_ONLY;

  constructor(_ngControl: NgControl) {
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
      this.allowedChars = cIsNegativeNumberAllowed?.currentValue
        ? NUMBER_CHARS_WITH_NEGATIVE
        : NUMBER_CHARS_POSITIVE_ONLY;
    }
  }

  editConstantValue(): void {
    this._richEditorDialogs
      .editText(this.value.toString(), {
        predefinedMode: this.predefinedRichEditorMode,
        allowedModes: this.allowedRichEditorModes,
      })
      .subscribe((value) => {
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
