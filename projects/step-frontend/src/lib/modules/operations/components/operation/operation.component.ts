import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Operation } from '@exense/step-core';
import { ExecutionViewServices } from '../../shared/execution-view-services';

export enum SpecificOperations {
  KEYWORD_CALL = 'Keyword Call',
  QUOTA_ACQUISITION = 'Quota acquisition',
  TOKEN_SELECTION = 'Token selection',
  WAITING_FOR_LOCK = 'Waiting for lock',
  WAITING_FOR_GLOBAL_LOCK = 'Waiting for global lock',
}

@Component({
  selector: 'step-operation',
  templateUrl: './operation.component.html',
  styleUrls: ['./operation.component.scss'],
})
export class OperationComponent implements OnChanges {
  readonly SpecificOperations = SpecificOperations;

  @Input() operation?: Operation;
  @Input() executionViewServices?: ExecutionViewServices;
  @Input() showOnlyDetails?: boolean;
  isObject: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    const cOperation = changes['operation'];
    if (cOperation?.currentValue !== cOperation?.previousValue) {
      const details = cOperation?.currentValue?.details;
      this.isObject = !!details && typeof details === 'object';
    }
  }
}
