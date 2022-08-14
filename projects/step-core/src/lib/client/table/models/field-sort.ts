import { SortDirection } from './sort-direction.enum';

export interface FieldSort {
  field: string;
  direction: SortDirection;
}
