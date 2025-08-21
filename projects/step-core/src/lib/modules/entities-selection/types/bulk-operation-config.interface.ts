import { BulkSelectionType } from './bulk-selection-type.enum';
import { TableRequestData } from '../../../client/step-client-module';
import { EntityBulkOperationInfo } from './entity-bulk-operation-info.interface';

export interface BulkOperationConfig<ID> {
  operationInfo: EntityBulkOperationInfo;
  selectionType: BulkSelectionType;
  ids?: ReadonlyArray<ID>;
  filterRequest?: TableRequestData;
  withPreview: boolean;
}
