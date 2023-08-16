import { Component, TrackByFunction, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueBoolean,
  DynamicValueString,
} from '@exense/step-core';
import { OperatorType } from '../../shared/operator-type.enum';
import { NgForm } from '@angular/forms';
import { KeyValue } from '@angular/common';

interface AssertArtefact extends AbstractArtefact {
  actual: DynamicValueString;
  operator: OperatorType;
  expected: DynamicValueString;
  doNegate: DynamicValueBoolean;
  customErrorMessage: DynamicValueString;
}

type OperatorTypeEntry = KeyValue<OperatorType, string>;

const createOperatorTypeEntry = (key: OperatorType, value: string): OperatorTypeEntry => ({ key, value });

@Component({
  selector: 'step-assert',
  templateUrl: './assert.component.html',
  styleUrls: ['./assert.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class AssertComponent extends BaseArtefactComponent<AssertArtefact> {
  @ViewChild('form')
  protected form!: NgForm;

  readonly operatorTypes: OperatorTypeEntry[] = [
    createOperatorTypeEntry(OperatorType.EQUALS, 'equals'),
    createOperatorTypeEntry(OperatorType.BEGINS_WITH, 'begins with'),
    createOperatorTypeEntry(OperatorType.CONTAINS, 'contains'),
    createOperatorTypeEntry(OperatorType.ENDS_WITH, 'ends with'),
    createOperatorTypeEntry(OperatorType.MATCHES, 'matches'),
  ];

  readonly trackByOperatorType: TrackByFunction<OperatorTypeEntry> = (index, item) => item.key;
}
