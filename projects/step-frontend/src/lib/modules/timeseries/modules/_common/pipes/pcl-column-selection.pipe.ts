import { inject, Pipe, PipeTransform } from '@angular/core';
import { ColumnSelection, PclColumnSelection, TreeAction, TreeActionsService, TreeNode } from '@exense/step-core';

@Pipe({
  name: 'pclColumnSelection',
  standalone: true,
})
export class PclColumnSelectionPipe implements PipeTransform {
  transform(column: ColumnSelection): PclColumnSelection {
    return column as PclColumnSelection;
  }
}
