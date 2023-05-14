import { TablePersistenceConfig } from '../shared/table-persistence-config';
import { Provider } from '@angular/core';

export type TablePersistenceConfigProviderOptions = Omit<TablePersistenceConfig, 'tableId'>;

export const STORE_ALL: TablePersistenceConfigProviderOptions = {
  storePagination: true,
  storeSort: true,
  storeSearch: true,
};

export const tablePersistenceConfigProvider = (
  tableId: string,
  options: TablePersistenceConfigProviderOptions = {}
): Provider => ({
  provide: TablePersistenceConfig,
  useValue: {
    tableId,
    ...options,
  } as TablePersistenceConfig,
});
