import { TableFilter } from '../../../client/generated';
import { EntityObject } from './entity-object';

export interface SelectEntityOfTypeResult {
  entity: { entityName?: string; displayName?: string };
  selectAll?: boolean;
  assignAll?: boolean;
  item?: EntityObject;
  array?: string[];
  filters?: TableFilter[];
}
