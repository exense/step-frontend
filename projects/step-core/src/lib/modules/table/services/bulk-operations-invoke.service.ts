import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { BulkOperation } from '../shared/bulk-operation.enum';
import { TableRequestData } from '../../../client/table/models/table-request-data';
import { BulkSelectionType } from '../../entities-selection/shared/bulk-selection-type.enum';
import { a1Promise2Observable, DialogsService } from '../../../shared';
import { catchError } from 'rxjs/operators';

export interface BulkOperationConfig<ID> {
  operationType: BulkOperation;
  selectionType: BulkSelectionType;
  ids?: ReadonlyArray<ID>;
  filterRequest?: TableRequestData;
  isDraft: boolean;
}

@Injectable()
export class BulkOperationsInvokeService<ID> {
  constructor(private _dialogs: DialogsService) {}

  invoke(config: BulkOperationConfig<ID>): Observable<string> {
    // todo temporary mock implementation for demonstration
    const message = this.formMessage(config.isDraft, config.selectionType, config.operationType, config.ids);

    if (!config.isDraft) {
      return of(message);
    }

    const confirmMessage = `${message} Are you sure, to continue?`;
    return a1Promise2Observable(this._dialogs.showWarning(confirmMessage)).pipe(
      switchMap(() => of(true)),
      catchError(() => of(false)),
      switchMap((isConfirmed) => {
        if (isConfirmed) {
          const conf = { ...config, isDraft: false };
          return this.invoke(conf);
        }
        return of('');
      })
    );
  }

  private formMessage(
    isDraft: boolean,
    selectionType: BulkSelectionType,
    operationType: BulkOperation,
    ids?: ReadonlyArray<ID>
  ): string {
    let items = '';
    switch (selectionType) {
      case BulkSelectionType.All:
        items = 'All items';
        break;
      case BulkSelectionType.Filtered:
        items = 'Items according to selected filter';
        break;
      default:
        items = `${(ids || []).length} item(s)`;
        break;
    }
    const condition = isDraft ? 'will be' : 'were';
    let operation = '';
    switch (operationType) {
      case BulkOperation.delete:
        operation = 'deleted.';
        break;
      case BulkOperation.duplicate:
        operation = 'duplicated.';
        break;
      case BulkOperation.export:
        operation = 'exported.';
        break;
    }
    return [items, condition, operation].join(' ');
  }
}
