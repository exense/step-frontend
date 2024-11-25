import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';

@Pipe({
  name: 'itemTooltip',
  standalone: true,
})
export class ItemTooltipPipe implements PipeTransform {
  transform(value: KeyValue<string, string>): string {
    return `${value.key}: ${value.value}`;
  }
}
