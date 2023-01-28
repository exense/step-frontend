import { Pipe, PipeTransform } from '@angular/core';
import { DynamicValueString } from '../client/step-client-module';

@Pipe({
  name: 'dynamicAttribute',
})
export class DynamicAttributePipe implements PipeTransform {
  transform(value: string | Record<string, DynamicValueString> | undefined, attributeName: string): string | undefined {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      let parsedValue: Record<string, DynamicValueString>;
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        return '';
      }
      return this.transform(parsedValue, attributeName);
    }

    return this.getAttribute(value[attributeName]);
  }

  private getAttribute(attribute?: DynamicValueString): string | undefined {
    if (!attribute) {
      return '';
    }
    if (attribute.dynamic) {
      return attribute.expression;
    }
    return attribute.value;
  }
}
