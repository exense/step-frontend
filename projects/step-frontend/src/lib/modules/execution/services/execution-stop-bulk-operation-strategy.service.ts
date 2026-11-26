import { inject, Injectable } from '@angular/core';
import {
  AsyncOperationCloseStatus,
  AsyncOperationDialogResult,
  AugmentedExecutionsService,
  BulkOperationConfig,
  BulkOperationPerformStrategy,
  BulkSelectionType,
  TableBulkOperationRequest,
} from '@exense/step-core';
import { Observable, of, switchMap } from 'rxjs';
import { ExecutionStopConfirmationService } from './execution-stop-confirmation.service';

@Injectable()
export class ExecutionStopBulkOperationStrategyService implements BulkOperationPerformStrategy<string> {
  private readonly _executions = inject(AugmentedExecutionsService);
  private readonly _stopConfirmation = inject(ExecutionStopConfirmationService);
  private readonly _defaultStrategy = inject(BulkOperationPerformStrategy);

  invoke(config: BulkOperationConfig<string>): Observable<AsyncOperationDialogResult | undefined> {
    const { selectionType, operationInfo } = config;
    const previewBody = this.createPreviewBody(config);
    return this._stopConfirmation
      .confirmBulkStop({ selectionType, preview: () => operationInfo.operation(previewBody) })
      .pipe(
        switchMap((result) => {
          if (result === undefined) {
            return of({ closeStatus: AsyncOperationCloseStatus.NO_ACTION });
          }
          if (typeof result !== 'string') {
            return of({ closeStatus: AsyncOperationCloseStatus.ERROR, error: result.previewError });
          }
          return this._defaultStrategy.invoke({
            ...config,
            withPreview: false,
            operationInfo: {
              ...operationInfo,
              operation: () => this._executions.stopExecutions(result, { ...previewBody, preview: false }),
            },
          });
        }),
      );
  }

  private createPreviewBody(config: BulkOperationConfig<string>): TableBulkOperationRequest {
    switch (config.selectionType) {
      case BulkSelectionType.ALL:
        return { targetType: 'ALL', preview: true };
      case BulkSelectionType.FILTERED: {
        const { filters, tableParameters } = config.filterRequest ?? {};
        const previewBody: TableBulkOperationRequest = {
          targetType: filters ? 'FILTER' : 'ALL',
          filters,
          tableParameters,
          preview: true,
        };
        return JSON.parse(JSON.stringify(previewBody)) as TableBulkOperationRequest;
      }
      case BulkSelectionType.NONE:
        return { targetType: 'LIST', ids: [], preview: true };
      case BulkSelectionType.INDIVIDUAL:
      case BulkSelectionType.VISIBLE:
        return { targetType: 'LIST', ids: config.ids?.map(String) ?? [], preview: true };
    }
  }
}
