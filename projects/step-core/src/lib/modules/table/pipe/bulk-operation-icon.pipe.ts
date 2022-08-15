import { Pipe, PipeTransform } from '@angular/core';
import { BulkOperation } from '../shared/bulk-operation.enum';

@Pipe({
  name: 'bulkOperationIcon',
})
export class BulkOperationIconPipe implements PipeTransform {
  transform(value: BulkOperation): string {
    switch (value) {
      case BulkOperation.delete:
        return 'clear';
      case BulkOperation.duplicate:
        return 'content_copy';
      case BulkOperation.export:
        return 'share';
      default:
        return '';
    }
  }
}
