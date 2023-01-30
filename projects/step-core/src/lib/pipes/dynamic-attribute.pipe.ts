import { Pipe, PipeTransform } from '@angular/core';
import { DynamicValueString } from '../client/step-client-module';

@Pipe({
  name: 'dynamicAttribute',
})
export class DynamicAttributePipe implements PipeTransform {
  transform(attribute?: DynamicValueString): string | undefined {
    return DynamicAttributePipe.transform(attribute);
  }

  static transform(attribute?: DynamicValueString): string | undefined {
    if (!attribute) {
      return '';
    }
    if (attribute.dynamic) {
      return attribute.expression;
    }
    return attribute.value;
  }
}
