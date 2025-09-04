import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { TableSelectionList } from './table-selection-list';
import { TableRemoteSelectionList } from './table-remote-selection-list';
import { TableLocalSelectionList } from './table-local-selection-list';
import { TableDataSource } from '../table-data-source';
import { TableRemoteDataSource } from '../table-remote-data-source';
import { TableLocalDataSource } from '../table-local-data-source';

@Injectable()
export class TableSelectionListFactoryService {
  private _injector = inject(Injector);

  create<T>(tableDataSource?: TableDataSource<T>): TableSelectionList<T, TableDataSource<T>> | undefined {
    if (!tableDataSource) {
      return undefined;
    }

    if (tableDataSource instanceof TableRemoteDataSource) {
      return runInInjectionContext(this._injector, () => new TableRemoteSelectionList(tableDataSource)) || undefined;
    } else if (tableDataSource instanceof TableLocalDataSource) {
      return runInInjectionContext(this._injector, () => new TableLocalSelectionList(tableDataSource)) || undefined;
    }

    return undefined;
  }
}
