import { Pipe, PipeTransform } from '@angular/core';
import { BulkOperationType } from '../shared/bulk-operation-type.enum';

@Pipe({
  name: 'bulkOperationIcon',
})
export class BulkOperationIconPipe implements PipeTransform {
  transform(value: BulkOperationType): string {
    switch (value) {
      case BulkOperationType.delete:
        return 'trash-2';
      case BulkOperationType.duplicate:
        return 'copy';
      case BulkOperationType.export:
        return 'upload';
      default:
        return '';
    }
  }
}
