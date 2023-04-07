import { FilterCondition } from './filter-condition';
import { TableRequestFilter } from '../../../client/step-client-module';

export class BasicFilterCondition extends FilterCondition {
  constructor(private filters: TableRequestFilter[]) {
    super();
  }
  toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    return this.filters;
  }
}
