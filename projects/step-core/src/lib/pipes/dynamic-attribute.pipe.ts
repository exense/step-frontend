import { Pipe, PipeTransform } from '@angular/core';
import { DynamicValue } from '../client/step-client-module';

@Pipe({
  name: 'dynamicAttribute',
})
export class DynamicAttributePipe implements PipeTransform {
  transform(attribute?: DynamicValue): string | boolean | number | undefined {
    return DynamicAttributePipe.transform(attribute);
  }

  static transform(attribute?: DynamicValue): string | boolean | number | undefined {
    if (!attribute) {
      return '';
    }

    if (attribute.dynamic) {
      return attribute.expression;
    }

    const value = attribute.value;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    return value?.toString();
  }
}
