import { Pipe, PipeTransform } from '@angular/core';
import { TableEntry } from './table-dashlet.component';
import { TimeSeriesConfig } from '../../modules/_common';

@Pipe({
  name: 'tableEntryFormat',
})
export class TableEntryFormatPipe implements PipeTransform {
  transform(entry: TableEntry, ...args: any[]): any {
    return this.mergeLabelItems(entry.groupingLabels);
  }

  private mergeLabelItems(items: (string | undefined)[]): string {
    if (items.length === 0) {
      return TimeSeriesConfig.SERIES_LABEL_VALUE;
    }
    return items.map((i) => i ?? TimeSeriesConfig.SERIES_LABEL_EMPTY).join(' | ');
  }
}
