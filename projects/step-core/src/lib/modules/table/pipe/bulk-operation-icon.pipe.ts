import { Pipe, PipeTransform } from '@angular/core';
import { BulkOperation } from '../shared/bulk-operation.enum';

@Pipe({
  name: 'bulkOperationIcon',
})
export class BulkOperationIconPipe implements PipeTransform {
  transform(value: BulkOperation): string {
    switch (value) {
      case BulkOperation.delete:
        return 'x';
      case BulkOperation.duplicate:
        return 'copy';
      case BulkOperation.export:
        return 'upload';
      default:
        return '';
    }
  }
}
