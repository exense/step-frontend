import { DynamicFieldType } from './dynamic-field-type';
import { FormControl } from '@angular/forms';
import { DynamicValueString } from '../../../client/step-client-module';

export interface DynamicFieldMetaData {
  trackId: string;
  key: string;
  label?: string;
  tooltip?: string;
  fieldType: DynamicFieldType;
  isAdditional?: boolean;
  isRequired?: boolean;
  control: FormControl<DynamicValueString>;
  enumItems?: string[];
}
