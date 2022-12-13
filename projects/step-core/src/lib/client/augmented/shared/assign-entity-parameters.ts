import { TableFilter } from '../../generated';

export interface AssignEntityParameters {
  entityName?: string;
  filter?: string;
  recursive?: boolean;
  simulation?: boolean;
  filters?: TableFilter[];
}
