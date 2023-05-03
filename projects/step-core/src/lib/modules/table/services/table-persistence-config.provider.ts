import { TablePersistenceConfig } from '../shared/table-persistence-config';
import { Provider } from '@angular/core';

export const tablePersistenceConfigProvider = (
  tableId: string,
  options: Omit<TablePersistenceConfig, 'tableId'> = {}
): Provider => ({
  provide: TablePersistenceConfig,
  useValue: {
    tableId,
    ...options,
  } as TablePersistenceConfig,
});
