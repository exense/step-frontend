import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';
import { KeywordSelection } from '../../execution-page/time-series-keywords.context';

@Pipe({ name: 'measurementsProcessor' })
export class MeasurementsFilterPipe implements PipeTransform {
  transform(items: { [key: string]: KeywordSelection }, searchValue: string): KeyValue<any, any>[] {
    let array: KeyValue<any, any>[] = Object.keys(items).map((key) => {
      return { key: key, value: items[key] };
    });
    if (searchValue) {
      array = array.filter((item) => item.key?.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0);
    }
    let x = array.sort((a, b) => a.key.localeCompare(b.key));
    console.log(x);
    return x;
  }
}
