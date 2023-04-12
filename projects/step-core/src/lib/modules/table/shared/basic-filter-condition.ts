import { FilterCondition } from './filter-condition';
import { TableRequestFilter } from '../../../client/step-client-module';

export class BasicFilterCondition extends FilterCondition {
  constructor(private filters: TableRequestFilter[]) {
    super();
  }
  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    return this.filters;
  }

  override isEmpty(): boolean {
    return !this.filters || this.filters.length === 0;
  }
}
