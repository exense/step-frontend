import { Pipe, PipeTransform } from '@angular/core';
import { DynamicValueBoolean, DynamicValueInteger, DynamicValueString } from '../client/step-client-module';

@Pipe({
  name: 'dynamicAttribute',
})
export class DynamicAttributePipe implements PipeTransform {
  transform(attribute?: DynamicValueString): string | boolean | number | undefined {
    return DynamicAttributePipe.transform(attribute);
  }

  static transform(
    attribute?: DynamicValueString | DynamicValueBoolean | DynamicValueInteger
  ): string | boolean | number | undefined {
    if (!attribute) {
      return '';
    }

    if (attribute.dynamic) {
      return attribute.expression;
    }

    return attribute.value;
  }
}
