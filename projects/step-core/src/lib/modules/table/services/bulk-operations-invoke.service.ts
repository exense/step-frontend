import { Observable, of, switchMap } from 'rxjs';
import { BulkOperationType } from '../../basics/step-basics.module';
import {
  TableRequestData,
  TableBulkOperationRequest,
  TableParameters,
  AsyncTaskStatus,
} from '../../../client/step-client-module';
import { BulkSelectionType } from '../../entities-selection/shared/bulk-selection-type.enum';
import { TableFilter } from './table-filter';
import {
  AsyncOperationCloseStatus,
  AsyncOperationDialogOptions,
  AsyncOperationDialogResult,
  AsyncOperationService,
} from '../../async-operations/async-operations.module';
import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TitleCasePipe } from '@angular/common';
import { EntityBulkOperationInfo } from '../../custom-registeries/custom-registries.module';

export interface BulkOperationConfig<ID> {
  operationInfo?: EntityBulkOperationInfo;
  operationType?: BulkOperationType;
  selectionType: BulkSelectionType;
  ids?: ReadonlyArray<ID>;
  filterRequest?: TableRequestData;
  withPreview: boolean;
}

const formatMessageWithDeleteWarning = (
  strings: TemplateStringsArray,
  operationType: BulkOperationType | string,
  ...otherExpressions: string[]
) => {
  const firstPart = strings[0] + operationType;
  let restPart = strings.slice(1).reduce((result, part, index) => result + part + (otherExpressions[index] ?? ''), '');
  if (operationType === BulkOperationType.delete) {
    restPart = `<strong class="danger-warning">${restPart}</strong>`;
  }
  return firstPart + restPart;
};

@Injectable({
  providedIn: 'root',
})
export class BulkOperationsInvokeService<ID = string> {
  protected _sanitizer = inject(DomSanitizer);
  protected _titleCase = inject(TitleCasePipe);
  protected _asyncOperationService = inject(AsyncOperationService);

  protected invokeDelete?(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus>;
  protected invokeDuplicate?(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus>;
  protected invokeExport?(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus>;
  protected invokeRestart?(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus>;
  protected invokeStop?(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatus>;

  protected transformConfig(config: BulkOperationConfig<ID>, isPreview: boolean): TableBulkOperationRequest {
    let targetType: TableBulkOperationRequest['targetType'] = 'LIST';
    let ids: string[] | undefined = undefined;
    let filters: TableFilter[] | undefined = undefined;
    let tableParameters: TableParameters | undefined = undefined;

    switch (config.selectionType) {
      case BulkSelectionType.All:
        targetType = 'ALL';
        break;
      case BulkSelectionType.Filtered:
        targetType = 'FILTER';
        filters = config.filterRequest?.filters as TableFilter[] | undefined;
        tableParameters = config.filterRequest?.tableParameters;
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
    if (targetType === 'FILTER' && !filters) {
      targetType = 'ALL';
    }

    return { targetType, ids, filters, tableParameters, preview: isPreview };
  }

  invoke(config: BulkOperationConfig<ID>): Observable<AsyncOperationDialogResult | undefined> {
    let operation: ((params: TableBulkOperationRequest) => Observable<AsyncTaskStatus>) | undefined;
    switch (config?.operationType) {
      case BulkOperationType.delete:
        operation = !!this.invokeDelete ? (params) => this.invokeDelete!(params) : undefined;
        break;
      case BulkOperationType.duplicate:
        operation = !!this.invokeDuplicate ? (params) => this.invokeDuplicate!(params) : undefined;
        break;
      case BulkOperationType.export:
        operation = !!this.invokeExport ? (params) => this.invokeExport!(params) : undefined;
        break;
      case BulkOperationType.restart:
        operation = !!this.invokeRestart ? (params) => this.invokeRestart!(params) : undefined;
        break;
      case BulkOperationType.stop:
        operation = !!this.invokeStop ? (params) => this.invokeStop!(params) : undefined;
        break;
      default:
        operation = config.operationInfo?.operation;
        break;
    }

    if (!operation) {
      console.error(`Operation ${this.getOperationType(config)} not supported`);
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

  protected createPreviewTitle(config: BulkOperationConfig<ID>): SafeHtml {
    const operationType = this.getOperationType(config);
    const operation = this._titleCase.transform(operationType);
    let title = `Confirm ${operation}`;
    if (operationType === BulkOperationType.delete && config.selectionType === BulkSelectionType.All) {
      title = `<span class="danger-warning">${title}</span>`;
    }
    return this._sanitizer.bypassSecurityTrustHtml(title);
  }

  protected createPerformTitle(config: BulkOperationConfig<ID>): string {
    return this._titleCase.transform(this.getOperationType(config));
  }

  protected createErrorMessageHandler(
    config: BulkOperationConfig<ID>
  ): (errorOrReulst: Error | AsyncTaskStatus) => string {
    return (errorOrResult) => {
      if (!(errorOrResult instanceof Error) && errorOrResult.error) {
        return `Error: ${errorOrResult.error}`;
      }

      return `An error occurred while ${this.getOperationType(config)} operation`;
    };
  }

  protected createSuccessMessageHandler(config: BulkOperationConfig<ID>): (result?: AsyncTaskStatus) => SafeHtml {
    return (result) => {
      const count = result?.result?.count;
      const message = count
        ? `Bulk operation ${this.getOperationType(config)} for ${count} item(s) completed`
        : `Bulk operation ${this.getOperationType(config)} for selected items completed`;
      return this._sanitizer.bypassSecurityTrustHtml(message);
    };
  }

  protected createSuccessMessagePreviewHandler(
    config: BulkOperationConfig<ID>
  ): (result?: AsyncTaskStatus) => SafeHtml {
    return (result) => {
      const count = result?.result?.count;
      const operationType = this.getOperationType(config);

      let message: string;
      if (config.selectionType === BulkSelectionType.All) {
        message = count
          ? formatMessageWithDeleteWarning`Do you want to ${operationType} all ${count} selected item(s)`
          : formatMessageWithDeleteWarning`Do you want to ${operationType} all selected items`;
      } else {
        message = count
          ? `Do you want to ${operationType} the ${count} selected item(s)`
          : `Do you want to ${operationType} all selected items`;
      }
      message = `${message}?`;

      return this._sanitizer.bypassSecurityTrustHtml(message);
    };
  }

  private getOperationType(config: BulkOperationConfig<ID>): string {
    return config?.operationType ?? config?.operationInfo?.type ?? '';
  }
}
