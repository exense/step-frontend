import { AfterViewInit, Component, OnDestroy, TrackByFunction, ViewChild } from '@angular/core';
import {
  AbstractArtefact,
  ArtefactFormChangeHelperService,
  BaseArtefactComponent,
  DynamicValueBoolean,
  DynamicValueString,
} from '@exense/step-core';
import { OperatorType } from '../../shared/operator-type.enum';
import { NgForm, NgModel } from '@angular/forms';
import { KeyValue } from '@angular/common';
import { map, Observable, of, startWith, Subject, takeUntil } from 'rxjs';

interface AssertArtefact extends AbstractArtefact {
  actual: DynamicValueString;
  operator: OperatorType;
  expected: DynamicValueString;
  doNegate: DynamicValueBoolean;
  customErrorMessage: DynamicValueString;
}

type OperatorTypeEntry = KeyValue<OperatorType, string>;

const createOperatorTypeEntry = (key: OperatorType, value: string): OperatorTypeEntry => ({ key, value });

const NUMBER_OPERATORS = [
  OperatorType.LESS_THAN,
  OperatorType.LESS_THAN_OR_EQUALS,
  OperatorType.GREATER_THAN,
  OperatorType.GREATER_THAN_OR_EQUALS,
];

@Component({
  selector: 'step-assert',
  templateUrl: './assert.component.html',
  styleUrls: ['./assert.component.scss'],
  providers: [ArtefactFormChangeHelperService],
})
export class AssertComponent extends BaseArtefactComponent<AssertArtefact> implements AfterViewInit, OnDestroy {
  private terminator$ = new Subject<void>();

  @ViewChild('form')
  protected form!: NgForm;

  @ViewChild('operator', { read: NgModel })
  private operator!: NgModel;

  protected isNumberExpectedValue$: Observable<boolean> = of(false);

  readonly operatorTypes: OperatorTypeEntry[] = [
    createOperatorTypeEntry(OperatorType.EQUALS, 'equals'),
    createOperatorTypeEntry(OperatorType.BEGINS_WITH, 'begins with'),
    createOperatorTypeEntry(OperatorType.CONTAINS, 'contains'),
    createOperatorTypeEntry(OperatorType.ENDS_WITH, 'ends with'),
    createOperatorTypeEntry(OperatorType.MATCHES, 'matches'),
    createOperatorTypeEntry(OperatorType.LESS_THAN, 'less than'),
    createOperatorTypeEntry(OperatorType.LESS_THAN_OR_EQUALS, 'less than or equals'),
    createOperatorTypeEntry(OperatorType.GREATER_THAN, 'greater than'),
    createOperatorTypeEntry(OperatorType.GREATER_THAN_OR_EQUALS, 'greater than or equals'),
    createOperatorTypeEntry(OperatorType.IS_NULL, 'is null'),
  ];

  readonly trackByOperatorType: TrackByFunction<OperatorTypeEntry> = (index, item) => item.key;

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.setupNumberExpectedValue();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.terminator$.next();
    this.terminator$.complete();
  }

  private setupNumberExpectedValue(): void {
    this.isNumberExpectedValue$ = this.operator.valueChanges!.pipe(
      startWith(this.context!.artefact!.operator),
      map((operator) => NUMBER_OPERATORS.includes(operator)),
      takeUntil(this.terminator$)
    );
  }
}
