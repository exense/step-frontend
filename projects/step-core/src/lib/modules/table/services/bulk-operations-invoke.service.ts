import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { BulkOperation } from '../shared/bulk-operation.enum';
import { TableRequestData } from '../../../client/table/models/table-request-data';
import { BulkSelectionType } from '../../entities-selection/shared/bulk-selection-type.enum';
import { AsyncTasksService, AsyncTaskStatusVoid, BulkOperationParameters } from '../../../client/generated';
import { TableFilter } from './table-filter';
import { pollAsyncTask } from '../../../client/augmented/rxjs-operators/poll-async-task';
import { a1Promise2Observable, DialogsService } from '../../../shared';

export interface BulkOperationConfig<ID> {
  operationType: BulkOperation;
  selectionType: BulkSelectionType;
  ids?: ReadonlyArray<ID>;
  filterRequest?: TableRequestData;
  isDraft: boolean;
}

export abstract class BulkOperationsInvokeService<ID> {
  protected constructor(protected _asyncTaskService: AsyncTasksService, protected _dialogs: DialogsService) {}

  protected abstract invokeDelete?(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatusVoid>;
  protected abstract invokeDuplicate?(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatusVoid>;
  protected abstract invokeExport?(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatusVoid>;

  protected transformConfig(config: BulkOperationConfig<ID>): BulkOperationParameters {
    // todo: simulation logic isn't supported on BE, don't forget to update the FE, when simulation will appear
    const simulate = false; //config.isDraft;

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

    return { targetType, ids, filter, simulate };
  }

  invoke(config: BulkOperationConfig<ID>): Observable<AsyncTaskStatusVoid | undefined> {
    let operation: ((params: BulkOperationParameters) => Observable<AsyncTaskStatusVoid>) | undefined;
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

    // Confirmation message should be provided by simulation logic
    // Until it is not implemented, the simple confirm was added
    const confirmMessage = `Do you want to perform the bulk ${config.operationType} operation over selected items?`;

    return a1Promise2Observable(this._dialogs.showWarning(confirmMessage)).pipe(
      switchMap(() => operation!(this.transformConfig(config))),
      pollAsyncTask(this._asyncTaskService),
      catchError(() => of(undefined))
    );
  }
}
