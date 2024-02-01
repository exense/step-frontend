import { Component, TrackByFunction, ViewChild } from '@angular/core';
import { KeyValue } from '@angular/common';
import { NgForm } from '@angular/forms';
import {
  BaseArtefactComponent,
  dynamicValueFactory,
  AbstractArtefact,
  DynamicValueString,
  ArtefactFormChangeHelperService,
} from '@exense/step-core';
import { AggregatorType, AssertOperatorType } from '@exense/step-core';

const { createDynamicValueString } = dynamicValueFactory();

type OperatorTypeItem = KeyValue<AssertOperatorType, string>;
type AggregatorTypeItem = KeyValue<AggregatorType, string>;

const createOperatorTypeItem = (key: AssertOperatorType, value: string): OperatorTypeItem => ({ key, value });
const createAggregatorTypeItem = (key: AggregatorType, value: string): AggregatorTypeItem => ({ key, value });

interface AssertPerformanceArtefact extends AbstractArtefact {
  aggregator: AggregatorType;
  comparator: AssertOperatorType;
  expectedValue: DynamicValueString;
  filters?: {
    field: DynamicValueString;
    filter: DynamicValueString;
    filterType: AssertOperatorType;
  }[];
}

@Component({
  selector: 'step-assert-performance',
  templateUrl: './assert-performance.component.html',
  styleUrls: ['./assert-performance.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class AssertPerformanceComponent extends BaseArtefactComponent<AssertPerformanceArtefact> {
  @ViewChild('form')
  protected form!: NgForm;

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

  readonly trackByOperator: TrackByFunction<OperatorTypeItem> = (index, item) => item.key;
  readonly trackByAggregator: TrackByFunction<AggregatorTypeItem> = (index, item) => item.key;

  override contextChange(): void {
    super.contextChange();
    this.setDefaultFilters();
  }

  private setDefaultFilters(): void {
    const artefact = this.context.artefact;
    if (!artefact || artefact._class !== 'PerformanceAssert' || !!artefact.filters) {
      return;
    }
    artefact.filters = [
      {
        field: createDynamicValueString({ value: 'name' }),
        filter: createDynamicValueString({ value: '' }),
        filterType: AssertOperatorType.EQUALS,
      },
    ];
  }
}
