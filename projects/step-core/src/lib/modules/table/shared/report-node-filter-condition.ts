import { FilterCondition } from './filter-condition';
import { TableRequestFilter, Regex } from '../../../client/step-client-module';
import { CompareCondition } from '../../basics/shared/compare-condition.enum';
import { FilterConditionType } from './filter-condition-type.enum';

const COMMON_SEARCH_FIELDS = ['input', 'output', 'error.msg', 'name'];

export class ReportNodeFilterCondition extends FilterCondition<{ searchValue?: string; attributeValues: string[] }> {
  readonly filterConditionType = FilterConditionType.REPORT_NODE;

  constructor(searchValue?: string, attributeValues: string[] = []) {
    super({ searchValue, attributeValues });
  }

  override isEmpty(): boolean {
    return !this.sourceObject?.searchValue;
  }

  override toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    if (!this.sourceObject?.searchValue) {
      return [];
    }

    const commonSearchFields = COMMON_SEARCH_FIELDS.map((field) => this.createPredicate(field));
    const attributesSearchFields = this.sourceObject.attributeValues.map((attribute) => {
      const functionAttribute = attribute.replace('attributes.', 'functionAttributes.');
      return this.createPredicate(functionAttribute);
    });

    return [
      {
        collectionFilter: {
          type: CompareCondition.OR,
          children: [...commonSearchFields, ...attributesSearchFields],
        },
      },
    ];
  }

  private createPredicate(field: string): Regex {
    const type = CompareCondition.REGEX;
    const expression = this.sourceObject?.searchValue;
    const caseSensitive = false;
    return { type, field, expression, caseSensitive };
  }
}
