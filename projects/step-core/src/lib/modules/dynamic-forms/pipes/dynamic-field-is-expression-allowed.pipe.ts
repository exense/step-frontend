import { Pipe, PipeTransform } from '@angular/core';
import { DynamicFieldType } from '../shared/dynamic-field-type';

const DENIED_FIELD_TYPES = [
  DynamicFieldType.NUMBER,
  DynamicFieldType.BOOLEAN,
  DynamicFieldType.ARRAY,
  DynamicFieldType.ENUM,
];

@Pipe({
  name: 'dynamicFieldIsExpressionEditorAllowed',
  standalone: true,
})
export class DynamicFieldIsExpressionEditorAllowedPipe implements PipeTransform {
  transform(fieldType: DynamicFieldType): boolean {
    return !DENIED_FIELD_TYPES.includes(fieldType);
  }
}
