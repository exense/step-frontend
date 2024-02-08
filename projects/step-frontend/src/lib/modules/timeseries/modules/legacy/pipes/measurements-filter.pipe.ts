import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';
import { KeywordSelection } from '../../_common';

@Pipe({ name: 'measurementsProcessor', standalone: true })
export class MeasurementsFilterPipe implements PipeTransform {
  transform(items: { [key: string]: KeywordSelection }, searchValue: string): KeyValue<any, any>[] {
    let array: KeyValue<any, any>[] = Object.keys(items).map((key) => {
      return { key: key, value: items[key] };
    });
    if (searchValue) {
      array = array.filter((item) => item.key?.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0);
    }
    return array.sort((a, b) => a.key.localeCompare(b.key));
  }
}
