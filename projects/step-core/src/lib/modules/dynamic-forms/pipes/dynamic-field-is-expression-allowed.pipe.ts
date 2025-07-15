import { Pipe, PipeTransform } from '@angular/core';
import { JsonFieldType } from '../../json-forms';

const DENIED_FIELD_TYPES = [JsonFieldType.NUMBER, JsonFieldType.BOOLEAN, JsonFieldType.ARRAY, JsonFieldType.ENUM];

@Pipe({
  name: 'dynamicFieldIsExpressionEditorAllowed',
})
export class DynamicFieldIsExpressionEditorAllowedPipe implements PipeTransform {
  transform(fieldType: JsonFieldType): boolean {
    return !DENIED_FIELD_TYPES.includes(fieldType);
  }
}
