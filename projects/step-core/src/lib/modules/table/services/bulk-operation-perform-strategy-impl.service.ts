import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, of, switchMap } from 'rxjs';
import { TitleCasePipe } from '@angular/common';
import { TableFilter } from './table-filter';
import { BulkOperationType } from '../../basics/step-basics.module';
import {
  AsyncOperationCloseStatus,
  AsyncOperationDialogOptions,
  AsyncOperationDialogResult,
  AsyncOperationService,
} from '../../async-operations/async-operations.module';
import { BulkOperationConfig, BulkOperationPerformStrategy, BulkSelectionType } from '../../entities-selection';
import { TableBulkOperationRequest, TableParameters, AsyncTaskStatus } from '../../../client/step-client-module';

const formatMessageWithDeleteWarning = (
  strings: TemplateStringsArray,
  operationType: BulkOperationType | string,
  ...otherExpressions: string[]
) => {
  const firstPart = strings[0] + operationType;
  let restPart = strings.slice(1).reduce((result, part, index) => result + part + (otherExpressions[index] ?? ''), '');
  if (operationType === BulkOperationType.DELETE) {
    restPart = `<strong class="danger-warning">${restPart}</strong>`;
  }
  return firstPart + restPart;
};

@Injectable({
  providedIn: 'root',
})
export class BulkOperationPerformStrategyImplService<ID = string> implements BulkOperationPerformStrategy<ID> {
  private _sanitizer = inject(DomSanitizer);
  private _titleCase = inject(TitleCasePipe);
  private _asyncOperationService = inject(AsyncOperationService);

  invoke(config: BulkOperationConfig<ID>): Observable<AsyncOperationDialogResult> {
    const operation = config.operationInfo.operation;

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
        if (result.closeStatus !== AsyncOperationCloseStatus.SUCCESS) {
          return of(result);
        }
        return this._asyncOperationService.performOperation(optionsPerform);
      }),
    );
  }

  private transformConfig(config: BulkOperationConfig<ID>, isPreview: boolean): TableBulkOperationRequest {
    let targetType: TableBulkOperationRequest['targetType'] = 'LIST';
    let ids: string[] | undefined = undefined;
    let filters: TableFilter[] | undefined = undefined;
    let tableParameters: TableParameters | undefined = undefined;

    switch (config.selectionType) {
      case BulkSelectionType.ALL:
        targetType = 'ALL';
        break;
      case BulkSelectionType.FILTERED:
        targetType = 'FILTER';
        filters = config.filterRequest?.filters as TableFilter[] | undefined;
        tableParameters = config.filterRequest?.tableParameters;
        break;
      case BulkSelectionType.NONE:
        ids = [];
        break;
      case BulkSelectionType.INDIVIDUAL:
      case BulkSelectionType.VISIBLE:
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

  private createPreviewTitle(config: BulkOperationConfig<ID>): SafeHtml {
    const operationType = config.operationInfo.type;
    const operation = this._titleCase.transform(operationType);
    let title = `Confirm ${operation}`;
    if (operationType === BulkOperationType.DELETE && config.selectionType === BulkSelectionType.ALL) {
      title = `<span class="danger-warning">${title}</span>`;
    }
    return this._sanitizer.bypassSecurityTrustHtml(title);
  }

  private createPerformTitle(config: BulkOperationConfig<ID>): string {
    return this._titleCase.transform(config.operationInfo.type);
  }

  private createErrorMessageHandler(
    config: BulkOperationConfig<ID>,
  ): (errorOrReulst: Error | AsyncTaskStatus) => string {
    return (errorOrResult) => {
      if (!(errorOrResult instanceof Error) && errorOrResult.error) {
        return `Error: ${errorOrResult.error}`;
      }

      return `An error occurred while ${config.operationInfo.type} operation`;
    };
  }

  private createSuccessMessageHandler(config: BulkOperationConfig<ID>): (result?: AsyncTaskStatus) => SafeHtml {
    return (result) => {
      const count = result?.result?.count;
      const skipped = result?.result?.skipped;
      const failed = result?.result?.failed;

      let message =
        count || count === 0
          ? `Bulk operation ${config.operationInfo.type} for ${count} item(s) completed.`
          : `Bulk operation ${config.operationInfo.type} for selected items completed.`;

      if (skipped) {
        message += ` ${skipped} item(s) have been skipped.`;
      }

      if (failed) {
        message += ` ${failed} item(s) have failed.`;
      }
      return this._sanitizer.bypassSecurityTrustHtml(message);
    };
  }

  private createSuccessMessagePreviewHandler(config: BulkOperationConfig<ID>): (result?: AsyncTaskStatus) => SafeHtml {
    return (result) => {
      const count = result?.result?.count;
      const operationType = config.operationInfo.type;

      let message: string;
      if (config.selectionType === BulkSelectionType.ALL) {
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
}
