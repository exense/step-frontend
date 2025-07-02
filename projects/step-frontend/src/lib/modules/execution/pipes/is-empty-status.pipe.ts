import { Pipe, PipeTransform } from '@angular/core';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';

@Pipe({
  name: 'isEmptyStatus',
  standalone: false,
})
export class IsEmptyStatusPipe implements PipeTransform {
  transform(value: AggregatedTreeNode): boolean {
    return IsEmptyStatusPipe.transform(value);
  }

  static transform(value: AggregatedTreeNode): boolean {
    const statusItems = Object.entries(value?.countByStatus ?? {}).reduce(
      (res, [key, count]) => {
        if (!!key && !!count) {
          res.push({ key, count });
        }
        return res;
      },
      [] as { key: string; count: number }[],
    );

    return statusItems.length === 0;
  }
}
