import { Pipe, PipeTransform } from '@angular/core';
import { DynamicFieldType } from '../shared/dynamic-field-type';

const DENY_EXPRESSION_EDITOR_FOR = [
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
    return !DENY_EXPRESSION_EDITOR_FOR.includes(fieldType);
  }
}
