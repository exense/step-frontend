import { inject, Pipe, PipeTransform } from '@angular/core';
import { AggregatedTreeNode } from '../shared/aggregated-tree-node';
import { Router } from '@angular/router';

@Pipe({
  name: 'isCurrentReportDetailsOpened',
})
export class IsCurrentReportDetailsOpenedPipe implements PipeTransform {
  private _router = inject(Router);

  transform(value?: AggregatedTreeNode): boolean {
    const isSingleStatus = Object.keys(value?.countByStatus ?? {}).length === 1;
    const reportNodeId = value?.singleInstanceReportNode?.id;

    if (!isSingleStatus || !reportNodeId) {
      return false;
    }

    return this._router.url.includes(`rnid_${reportNodeId}`);
  }
}
