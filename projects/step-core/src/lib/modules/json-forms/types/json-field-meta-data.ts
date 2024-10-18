import { FormControl } from '@angular/forms';
import { JsonFieldType } from './json-field-type.enum';

export interface JsonFieldMetaData {
  trackId: string;
  key: string;
  label?: string;
  tooltip?: string;
  fieldType: JsonFieldType;
  isAdditional?: boolean;
  isRequired?: boolean;
  control: FormControl<string | number | boolean>;
  enumItems?: string[];
}
