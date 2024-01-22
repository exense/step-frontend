import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toggleDynamicFieldTooltip',
})
export class ToggleDynamicFieldTooltipPipe implements PipeTransform {
  transform(fieldName?: string): string {
    fieldName = (fieldName ?? '').trim();
    return !fieldName
      ? 'Use dynamic expression to set this attribute'
      : `Use dynamic expression to set the [${fieldName}]`;
  }
}
