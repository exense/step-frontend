import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Operation } from '@exense/step-core';
import { ExecutionViewServices } from '../../types/execution-view-services';
import { SpecificOperations } from '../../types/specific-operations.enum';

@Component({
  selector: 'step-operation',
  templateUrl: './operation.component.html',
  styleUrls: ['./operation.component.scss'],
  standalone: false,
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
