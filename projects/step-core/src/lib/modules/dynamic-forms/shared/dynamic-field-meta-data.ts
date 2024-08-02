import { FormControl } from '@angular/forms';
import { DynamicValue } from '../../../client/step-client-module';
import { SchemaField } from './dynamic-fields-schema';
import { JsonFieldType } from '../../json-forms';

export interface DynamicFieldMetaData {
  trackId: string;
  key: string;
  label?: string;
  tooltip?: string;
  fieldType: JsonFieldType;
  fieldSchema?: SchemaField;
  isAdditional?: boolean;
  isRequired?: boolean;
  control: FormControl<DynamicValue>;
  enumItems?: string[];
}
