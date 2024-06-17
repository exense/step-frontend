import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnDestroy,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DynamicFieldType } from '../../shared/dynamic-field-type';
import { AceMode } from '../../../rich-editor';
import { DynamicSimpleValue } from '../../../../client/step-client-module';
import { DynamicFieldBaseComponent } from '../dynamic-field-base/dynamic-field-base.component';

@Component({
  selector: 'step-dynamic-field',
  templateUrl: './dynamic-field.component.html',
  styleUrls: ['./dynamic-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFieldComponent extends DynamicFieldBaseComponent<DynamicSimpleValue> {
  // protected complexFieldContext?: ComplexFieldContextService = this as ComplexFieldContextService;

  readonly DynamicFieldType = DynamicFieldType;
  readonly AceMode = AceMode;

  /*
  @Input() fieldSchema?: SchemaField;
  @Input() fieldObjectTemplate?: TemplateRef<ComplexFieldContext>;
*/

  /** @Input() **/
  readonly enumItems = input<string[] | undefined>([]);

  private enumItemsSet = computed(() => new Set(this.enumItems() ?? []));

  protected displayEnumExtraValue = computed(() => {
    const fieldType = this.fieldType();
    const enumItemsSet = this.enumItemsSet();
    const value = this.value();
    if (fieldType !== DynamicFieldType.ENUM) {
      return false;
    }
    return enumItemsSet.has(value ? value.toString() : '');
  });

  constructor(@Optional() _ngControl?: NgControl) {
    super(_ngControl);
  }

  /*
  ngOnDestroy(): void {
     this.complexFieldContext = undefined;
  }
*/
}
