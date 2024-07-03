import { SchemaField } from '../shared/dynamic-fields-schema';
import { DynamicValue } from '../../../client/augmented/step-augmented-client.module';
import { Signal, TemplateRef } from '@angular/core';

export type ComplexFieldContext = {
  $implicit: ComplexFieldContextService;
};

export abstract class ComplexFieldContextService {
  abstract fieldObjectTemplate: Signal<TemplateRef<ComplexFieldContext> | undefined>;
  abstract fieldArrayTemplate: Signal<TemplateRef<ComplexFieldContext> | undefined>;
  abstract isDisabled: Signal<boolean>;
  abstract fieldSchema: Signal<SchemaField | undefined>;
  abstract value: Signal<DynamicValue['value']>;
  abstract handleValueChange(value: DynamicValue['value']): void;
  abstract handleBlur(): void;
  abstract tabIndex: Signal<number | undefined>;
}
