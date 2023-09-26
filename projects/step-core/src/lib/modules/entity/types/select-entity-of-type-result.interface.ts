import { TableFilter } from '../../../client/generated';
import { EntityObject } from './entity-object';

export interface SelectEntityOfTypeResult {
  entity: { entityName?: string; displayName?: string }; // registered entity !!
  selectAll?: boolean; // flag when all entities are selected !!
  assignAll?: boolean; // flag when all entities are selected !!
  item?: EntityObject; // is used of single selection (not assign entity case)
  array?: string[]; // ids of selected entities (not all) !!
  filters?: TableFilter[]; // in case if table filter has been applied !!
}
