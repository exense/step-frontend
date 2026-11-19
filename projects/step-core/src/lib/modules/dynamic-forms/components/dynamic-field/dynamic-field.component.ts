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
  standalone: false,
})
export class DynamicFieldComponent extends DynamicFieldBaseComponent<DynamicSimpleValue> {
  readonly DynamicFieldType = JsonFieldType;
  readonly AceMode = AceMode;

  readonly enumItems = input<string[] | undefined>([]);

  private readonly enumItemsSet = computed(() => new Set(this.enumItems() ?? []));

  protected readonly displayEnumExtraValue = computed(() => {
    const fieldType = this.fieldType();
    const enumItemsSet = this.enumItemsSet();
    const value = this.value();
    if (fieldType !== JsonFieldType.ENUM) {
      return false;
    }
    return value && !enumItemsSet.has(value.toString());
  });
}
