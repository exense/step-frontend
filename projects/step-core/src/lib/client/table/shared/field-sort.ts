import { SortDirection } from './sort-direction.enum';
import { Sort } from '../../generated';

export interface FieldSort extends Sort {
  field: string;
  direction: SortDirection;
}
