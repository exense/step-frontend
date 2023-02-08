import { FormControl } from '@angular/forms';
import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '../../../client/step-client-module';
import { DynamicFieldType } from './dynamic-field-type';

export interface DynamicFieldMetaData {
  trackId: string;
  key: string;
  label?: string;
  tooltip?: string;
  fieldType: DynamicFieldType;
  isAdditional?: boolean;
  isRequired?: boolean;
  control: FormControl<DynamicValueString | DynamicValueBoolean | DynamicValueInteger>;
  enumItems?: string[];
}
