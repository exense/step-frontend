import { Pipe, PipeTransform } from '@angular/core';
import { BulkOperationType } from '../shared/bulk-operation-type.enum';

@Pipe({
  name: 'bulkOperationLabel',
})
export class BulkOperationLabelPipe implements PipeTransform {
  transform(value: BulkOperationType): string {
    switch (value) {
      case BulkOperationType.delete:
        return 'Delete selected';
      case BulkOperationType.duplicate:
        return 'Clone selected';
      case BulkOperationType.export:
        return 'Export selected';
      default:
        return '';
    }
  }
}
