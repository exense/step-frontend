import { Component, computed, input } from '@angular/core';
import { Operation, StepCoreModule } from '@exense/step-core';
import { AltCurrentOperationsComponent } from '../alt-current-operations/alt-current-operations.component';
import { SpecificOperations } from '../../types/specific-operations.enum';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-alt-current-operation-short',
  templateUrl: './alt-current-operation-short.component.html',
  imports: [StepCoreModule, AltCurrentOperationsComponent],
  styleUrl: './alt-current-operation-short.component.scss',
})
export class AltCurrentOperationShortComponent {
  readonly currentOperations = input<Operation[]>([]);
  private readonly firstOperation = computed(() => {
    const operations = this.currentOperations();
    return operations[0];
  });
  protected readonly firstOperationData = computed(() => {
    const operation = this.firstOperation();
    let result: KeyValue<string, string> | undefined = undefined;
    if (!operation) {
      return result;
    }
    switch (operation.name) {
      case SpecificOperations.KEYWORD_CALL:
        result = { key: 'Call Keyword', value: operation.details?.[0]?.name ?? '' };
        break;
      case SpecificOperations.QUOTA_ACQUISITION:
        result = { key: 'Quota Acquisition', value: operation.details?.id ?? '' };
        break;
      case SpecificOperations.TOKEN_SELECTION:
        result = { key: 'Token Selection', value: '' };
        break;
      case SpecificOperations.WAITING_FOR_LOCK:
        result = { key: 'Waiting for lock', value: operation?.details };
        break;
      case SpecificOperations.WAITING_FOR_GLOBAL_LOCK:
        result = { key: 'Waiting for global lock', value: operation?.details };
        break;
      default:
        result = { key: operation.name ?? '', value: '' };
        break;
    }
    return result;
  });
}
