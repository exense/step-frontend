import { TableRequestFilter } from '../../../client/step-client-module';

export abstract class FilterCondition {
  abstract toRequestFilter(field: string): Array<TableRequestFilter | undefined>;
}
