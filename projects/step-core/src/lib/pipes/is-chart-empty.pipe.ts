import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isChartEmpty',
  standalone: false,
})
export class IsChartEmptyPipe implements PipeTransform {
  transform(value: any | { series: any[]; data: any[][] }): boolean {
    const isSeriesEmpty = !value?.series?.length;
    const isDataEmpty = (value?.data || []).reduce((res: boolean, items: any[]) => {
      return res || (items || []).length === 0;
    }, false);
    return isSeriesEmpty || isDataEmpty;
  }
}
