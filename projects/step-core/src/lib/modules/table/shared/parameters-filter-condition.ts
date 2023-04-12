import { FilterCondition } from './filter-condition';
import { TableCollectionFilter, TableRequestFilter, Regex as RegexFilter } from '../../../client/step-client-module';
import { CompareCondition } from '../../basics/step-basics.module';

export class ParametersFilterCondition extends FilterCondition {
  constructor(private availableParameters: ReadonlyArray<string>, private searchValue?: string) {
    super();
  }

  override isEmpty(): boolean {
    return !this.searchValue;
  }

  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    if (!this.searchValue || this.availableParameters.length === 0) {
      return [];
    }

    const filter: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.OR,
        children: this.availableParameters.map(
          (parameter) =>
            ({
              type: CompareCondition.REGEX,
              field: `${field}.${parameter}`,
              expression: this.searchValue,
              caseSensitive: false,
            } as RegexFilter)
        ),
      },
    };

    return [filter];
  }
}
