import { Observable, of, switchMap } from 'rxjs';
import { BulkOperation } from '../shared/bulk-operation.enum';
import { TableRequestData } from '../../../client/table/models/table-request-data';
import { BulkSelectionType } from '../../entities-selection/shared/bulk-selection-type.enum';
import { BulkOperationParameters } from '../../../client/generated';
import { TableFilter } from './table-filter';
import {
  AsyncOperationCloseStatus,
  AsyncOperationDialogOptions,
  AsyncOperationDialogResult,
  AsyncOperationService,
} from '../../async-operations/async-operations.module';
import { AsyncTaskStatus } from '../../../client/augmented/shared/async-task-status';

export interface BulkOperationConfig<ID> {
  operationType: BulkOperation;
  selectionType: BulkSelectionType;
  ids?: ReadonlyArray<ID>;
  filterRequest?: TableRequestData;
  withPreview: boolean;
}

export abstract class BulkOperationsInvokeService<ID> {
  protected constructor(protected _asyncOperationService: AsyncOperationService) {}

  protected abstract invokeDelete?(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatus>;
  protected abstract invokeDuplicate?(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatus>;
  protected abstract invokeExport?(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatus>;

  protected transformConfig(config: BulkOperationConfig<ID>, isPreview: boolean): BulkOperationParameters {
    let targetType: BulkOperationParameters['targetType'] = 'LIST';
    let ids: string[] | undefined = undefined;
    let filter: TableFilter | undefined = undefined;

    switch (config.selectionType) {
      case BulkSelectionType.All:
        targetType = 'ALL';
        break;
      case BulkSelectionType.Filtered:
        targetType = 'FILTER';
        filter = config.filterRequest?.filters?.[0] as TableFilter;
        break;
      case BulkSelectionType.None:
        ids = [];
        break;
      case BulkSelectionType.Individual:
      case BulkSelectionType.Visible:
        ids = (config.ids || []).map((id) => {
          if (typeof id === 'string') {
            return id;
          }
          return (id as any).toString();
        });
        break;
      default:
        break;
    }

    // If filter type is selected and at the same time there is no filter provided by table
    // it is equal to all selection
    if (targetType === 'FILTER' && !filter) {
      targetType = 'ALL';
    }

    return { targetType, ids, filter, preview: isPreview };
  }

  invoke(config: BulkOperationConfig<ID>): Observable<AsyncOperationDialogResult | undefined> {
    let operation: ((params: BulkOperationParameters) => Observable<AsyncTaskStatus>) | undefined;
    switch (config.operationType) {
      case BulkOperation.delete:
        operation = !!this.invokeDelete ? (params) => this.invokeDelete!(params) : undefined;
        break;
      case BulkOperation.duplicate:
        operation = !!this.invokeDuplicate ? (params) => this.invokeDuplicate!(params) : undefined;
        break;
      case BulkOperation.export:
        operation = !!this.invokeExport ? (params) => this.invokeExport!(params) : undefined;
        break;
    }

    if (!operation) {
      console.error(`Operation ${config.operationType} not supported`);
      return of(undefined);
    }

    const optionsPerform: AsyncOperationDialogOptions = {
      asyncOperation: () => operation!(this.transformConfig(config, false)),
      title: this.createPerformTitle(config),
      successMessage: this.createSuccessMessageHandler(config),
      errorMessage: this.createErrorMessageHandler(config),
    };

    if (!config.withPreview) {
      return this._asyncOperationService.performOperation(optionsPerform);
    }

    const optionsPreview: AsyncOperationDialogOptions = {
      asyncOperation: () => operation!(this.transformConfig(config, true)),
      title: this.createPreviewTitle(config),
      showCloseButtonOnSuccess: true,
      successMessage: this.createSuccessMessagePreviewHandler(config),
      errorMessage: this.createErrorMessageHandler(config),
    };

    return this._asyncOperationService.performOperation(optionsPreview).pipe(
      switchMap((result) => {
        if (result.closeStatus !== AsyncOperationCloseStatus.success) {
          return of(result);
        }
        return this._asyncOperationService.performOperation(optionsPerform);
      })
    );
  }

  protected createPreviewTitle(config: BulkOperationConfig<ID>): string {
    return `Confirm ${config.operationType}`;
  }

  protected createPerformTitle(config: BulkOperationConfig<ID>): string {
    return config.operationType;
  }

  protected createErrorMessageHandler(
    config: BulkOperationConfig<ID>
  ): (errorOrReulst: Error | AsyncTaskStatus) => string {
    return (errorOrResult) => {
      if (!(errorOrResult instanceof Error) && errorOrResult.error) {
        return `Error: ${errorOrResult.error}`;
      }

      return `An error occurred while ${config.operationType} operation`;
    };
  }

  protected createSuccessMessageHandler(config: BulkOperationConfig<ID>): (result?: AsyncTaskStatus) => string {
    return (result) => {
      const count = result?.result?.count;
      return count
        ? `Bulk operation ${config.operationType} for ${count} item(s) completed`
        : `Bulk operation ${config.operationType} for selected items completed`;
    };
  }

  protected createSuccessMessagePreviewHandler(config: BulkOperationConfig<ID>): (result?: AsyncTaskStatus) => string {
    return (result) => {
      const count = result?.result?.count;
      return count
        ? `Do you want to ${config.operationType} the ${count} selected item(s)?`
        : `Do you want to ${config.operationType} all selected items?`;
    };
  }
}
