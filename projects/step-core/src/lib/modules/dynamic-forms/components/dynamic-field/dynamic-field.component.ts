import { ChangeDetectionStrategy, Component, computed, input, Optional, ViewEncapsulation } from '@angular/core';
import { NgControl } from '@angular/forms';
import { AceMode } from '../../../rich-editor';
import { DynamicSimpleValue } from '../../../../client/step-client-module';
import { DynamicFieldBaseComponent } from '../dynamic-field-base/dynamic-field-base.component';
import { JsonFieldType } from '../../../json-forms';

@Component({
  selector: 'step-dynamic-field',
  templateUrl: './dynamic-field.component.html',
  styleUrls: ['./dynamic-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFieldComponent extends DynamicFieldBaseComponent<DynamicSimpleValue> {
  readonly DynamicFieldType = JsonFieldType;
  readonly AceMode = AceMode;

  /** @Input() **/
  readonly enumItems = input<string[] | undefined>([]);

  private enumItemsSet = computed(() => new Set(this.enumItems() ?? []));

  protected displayEnumExtraValue = computed(() => {
    const fieldType = this.fieldType();
    const enumItemsSet = this.enumItemsSet();
    const value = this.value();
    if (fieldType !== JsonFieldType.ENUM) {
      return false;
    }
    return enumItemsSet.has(value ? value.toString() : '');
  });

  constructor(@Optional() _ngControl?: NgControl) {
    super(_ngControl);
  }
}
