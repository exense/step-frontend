import { Directive, effect, forwardRef, inject, input, OnDestroy, output, untracked } from '@angular/core';
import { TableReload } from '../services/table-reload';
import { GlobalReloadService } from '../../basics/step-basics.module';
import { TablePartPaginationDirective } from './table-part-pagination.directive';
import { TablePartDatasourceDirective } from './table-part-datasource.directive';

@Directive({
  selector: '[stepTablePartReload]',
  providers: [
    {
      provide: TableReload,
      useExisting: forwardRef(() => TablePartReloadDirective),
    },
  ],
})
export class TablePartReloadDirective implements TableReload, OnDestroy {
  private _globalReloadService = inject(GlobalReloadService);
  private _tablePagination = inject(TablePartPaginationDirective);
  private _tableDataSource = inject(TablePartDatasourceDirective);

  readonly blockGlobalReload = input(false);
  readonly reloadData = output<void>();

  private effectSetupGlobalReload = effect(() => {
    const isGlobalBlocked = this.blockGlobalReload();
    if (isGlobalBlocked) {
      this._globalReloadService.unRegister(this);
    } else {
      this._globalReloadService.register(this);
    }
  });

  ngOnDestroy(): void {
    this._globalReloadService.unRegister(this);
  }

  reload(isCausedByProjectChange?: boolean): void {
    this.reloadData.emit();
    untracked(() => this._tableDataSource.tableDataSource())?.reload();
    if (isCausedByProjectChange) {
      this._tablePagination.resetToFirstPage();
    }
  }
}
