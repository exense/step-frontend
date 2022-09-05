import { Pipe, PipeTransform } from '@angular/core';
import { BulkOperation } from '../shared/bulk-operation.enum';

@Pipe({
  name: 'bulkOperationLabel',
})
export class BulkOperationLabelPipe implements PipeTransform {
  transform(value: BulkOperation): string {
    switch (value) {
      case BulkOperation.delete:
        return 'Bulk Delete';
      case BulkOperation.duplicate:
        return 'Bulk Duplicate';
      case BulkOperation.export:
        return 'Bulk Export';
      default:
        return '';
    }
  }
}
