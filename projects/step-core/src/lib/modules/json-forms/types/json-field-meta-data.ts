import { FormControl } from '@angular/forms';
import { JsonFieldType } from './json-field-type.enum';
import { SchemaField } from './json-field-schema';

export interface JsonFieldMetaData<T = string | number | boolean> {
  trackId: string;
  key: string;
  label?: string;
  tooltip?: string;
  fieldType: JsonFieldType;
  fieldSchema?: SchemaField;
  isAdditional?: boolean;
  isRequired?: boolean;
  control: FormControl<T>;
  enumItems?: string[];
}
