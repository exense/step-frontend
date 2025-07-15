import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnDestroy,
  Optional,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { DynamicFieldBaseComponent } from '../dynamic-field-base/dynamic-field-base.component';
import { DynamicComplexValue } from '../../../../client/step-client-module';
import { NgControl } from '@angular/forms';
import { ComplexFieldContext, ComplexFieldContextService } from '../../services/complex-field-context.service';
import { AceMode } from '../../../rich-editor';
import { SchemaField, JsonFieldType } from '../../../json-forms';

@Component({
  selector: 'step-dynamic-field-complex',
  templateUrl: './dynamic-field-complex.component.html',
  styleUrl: './dynamic-field-complex.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DynamicFieldComplexComponent
  extends DynamicFieldBaseComponent<DynamicComplexValue>
  implements ComplexFieldContextService, OnDestroy
{
  protected fieldContext?: ComplexFieldContextService = this as ComplexFieldContextService;

  /** @Input() **/
  readonly fieldObjectTemplate = input<TemplateRef<ComplexFieldContext> | undefined>();

  /** @Input() **/
  readonly fieldArrayTemplate = input<TemplateRef<ComplexFieldContext> | undefined>();

  /** @Input() **/
  readonly fieldSchema = input<SchemaField | undefined>();

  constructor(@Optional() _ngControl?: NgControl) {
    super(_ngControl);
  }

  ngOnDestroy(): void {
    this.fieldContext = undefined;
  }

  protected readonly DynamicFieldType = JsonFieldType;
  protected readonly AceMode = AceMode;
}
