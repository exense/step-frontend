import { TableRequestFilter } from '../../../client/table/models/table-request-data';

export abstract class FilterCondition {
  abstract toRequestFilter(field: string): Array<TableRequestFilter | undefined>;
  abstract isEmpty(): boolean;
}
