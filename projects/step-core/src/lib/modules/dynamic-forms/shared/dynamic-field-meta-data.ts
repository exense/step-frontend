import { FormControl } from '@angular/forms';
import { DynamicValue } from '../../../client/step-client-module';
import { DynamicFieldType } from './dynamic-field-type';
import { SchemaField } from './dynamic-fields-schema';

export interface DynamicFieldMetaData {
  trackId: string;
  key: string;
  label?: string;
  tooltip?: string;
  fieldType: DynamicFieldType;
  fieldSchema?: SchemaField;
  isAdditional?: boolean;
  isRequired?: boolean;
  control: FormControl<DynamicValue>;
  enumItems?: string[];
}
