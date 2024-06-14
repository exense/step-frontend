import { SchemaField } from '../shared/dynamic-fields-schema';
import { DynamicValue } from '../../../client/augmented/step-augmented-client.module';
import { TemplateRef } from '@angular/core';

export type ComplexFieldContext = {
  $implicit: ComplexFieldContextService;
};

export abstract class ComplexFieldContextService {
  abstract fieldObjectTemplate?: TemplateRef<unknown>;
  abstract isDisabled: boolean;
  abstract fieldSchema?: SchemaField;
  abstract value: DynamicValue['value'];
  abstract valueChange(value: DynamicValue['value']): void;
  abstract handleBlur(): void;
  abstract tabIndex?: number;
}
