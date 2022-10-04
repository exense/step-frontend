import { BulkOperationType } from '../shared/bulk-operation-type.enum';

export type BulkOperation = {
  operation: BulkOperationType;
  permission?: string;
};
