import { FilterCondition } from './filter-condition';
import { TableRequestFilter } from '../../../client/table/models/table-request-data';
import { CompareCondition } from '../../basics/shared/compare-condition.enum';
import { Regex } from '../../../client/generated';

const COMMON_SEARCH_FIELDS = ['input', 'output', 'error.msg', 'name'];

export class ReportNodeFilterCondition extends FilterCondition {
  constructor(private searchValue?: string, private attributeValues: string[] = []) {
    super();
  }

  toRequestFilter(field: string): Array<TableRequestFilter | undefined> {
    if (!this.searchValue) {
      return [];
    }

    const commonSearchFields = COMMON_SEARCH_FIELDS.map((field) => this.createPredicate(field));
    const attributesSearchFields = this.attributeValues.map((attribute) => {
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
    const expression = this.searchValue;
    const caseSensitive = false;
    return { type, field, expression, caseSensitive };
  }
}
