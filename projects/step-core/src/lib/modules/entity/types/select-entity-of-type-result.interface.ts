import { TableFilter } from '../../../client/generated';

export interface SelectEntityOfTypeResult {
  entity: { entityName?: string; displayName?: string };
  selectAll?: boolean;
  assignAll?: boolean;
  item?: any;
  array?: string[];
  filters?: TableFilter[];
}
