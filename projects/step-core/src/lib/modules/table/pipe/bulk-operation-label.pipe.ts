import { Pipe, PipeTransform } from '@angular/core';
import { BulkOperation } from '../shared/bulk-operation.enum';

@Pipe({
  name: 'bulkOperationLabel',
})
export class BulkOperationLabelPipe implements PipeTransform {
  transform(value: BulkOperation): string {
    switch (value) {
      case BulkOperation.delete:
        return 'Delete selected';
      case BulkOperation.duplicate:
        return 'Clone selected';
      case BulkOperation.export:
        return 'Export selected';
      default:
        return '';
    }
  }
}
