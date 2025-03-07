import { Injectable } from '@angular/core';
import { KeyValue } from '@angular/common';
import { AggregatorType, AssertOperatorType } from '@exense/step-core';

export type OperatorTypeItem = KeyValue<AssertOperatorType, string>;
export type AggregatorTypeItem = KeyValue<AggregatorType, string>;

const createOperatorTypeItem = (key: AssertOperatorType, value: string): OperatorTypeItem => ({ key, value });
const createAggregatorTypeItem = (key: AggregatorType, value: string): AggregatorTypeItem => ({ key, value });

@Injectable({
  providedIn: 'root',
})
export class AssertPerformanceListService {
  readonly operatorTypes: OperatorTypeItem[] = [
    createOperatorTypeItem(AssertOperatorType.EQUALS, 'equals'),
    createOperatorTypeItem(AssertOperatorType.HIGHER_THAN, 'higher than'),
    createOperatorTypeItem(AssertOperatorType.LOWER_THAN, 'lower than'),
  ];

  readonly aggregatorTypes: AggregatorTypeItem[] = [
    createAggregatorTypeItem(AggregatorType.AVG, 'average'),
    createAggregatorTypeItem(AggregatorType.MAX, 'max'),
    createAggregatorTypeItem(AggregatorType.MIN, 'min'),
    createAggregatorTypeItem(AggregatorType.COUNT, 'count'),
    createAggregatorTypeItem(AggregatorType.SUM, 'sum'),
  ];

  readonly operatorTypeTexts = this.operatorTypes.reduce(
    (res, item) => {
      res[item.key] = item.value;
      return res;
    },
    {} as Record<AssertOperatorType, string>,
  );

  readonly aggregatorTypeTexts = this.aggregatorTypes.reduce(
    (res, item) => {
      res[item.key] = item.value;
      return res;
    },
    {} as Record<AggregatorType, string>,
  );
}
