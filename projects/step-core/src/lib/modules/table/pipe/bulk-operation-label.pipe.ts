import { Pipe, PipeTransform } from '@angular/core';
import { BulkOperationType } from '../../basics/step-basics.module';

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
      case BulkOperationType.restart:
        return 'Restart selected';
      case BulkOperationType.stop:
        return 'Stop selected';
      default:
        return '';
    }
  }
}
