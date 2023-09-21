import { BulkOperationType } from '../../basics/step-basics.module';

export type BulkOperation = {
  operation: BulkOperationType;
  permission?: string;
};
