import { FilterCondition } from './filter-condition';
import { TableCollectionFilter, TableRequestFilter, Regex as RegexFilter } from '../../../client/step-client-module';
import { CompareCondition } from '../../basics/step-basics.module';
import { FilterConditionType } from './filter-condition-type.enum';

export class ParametersFilterCondition extends FilterCondition<{
  availableParameters: ReadonlyArray<string>;
  searchValue?: string;
}> {
  readonly filterConditionType = FilterConditionType.PARAMETERS;

  constructor(availableParameters: ReadonlyArray<string>, searchValue?: string) {
    super({ availableParameters, searchValue });
  }

  override isEmpty(): boolean {
    return !this.sourceObject?.searchValue;
  }

  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    if (!this.sourceObject?.searchValue || !this.sourceObject?.availableParameters.length) {
      return [];
    }

    const filter: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.OR,
        children: this.sourceObject.availableParameters.map(
          (parameter) =>
            ({
              type: CompareCondition.REGEX,
              field: `${field}.${parameter}`,
              expression: this.sourceObject?.searchValue,
              caseSensitive: false,
            } as RegexFilter)
        ),
      },
    };

    return [filter];
  }
}
