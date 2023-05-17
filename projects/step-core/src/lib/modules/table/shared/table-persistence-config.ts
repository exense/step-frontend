export abstract class TablePersistenceConfig {
  abstract readonly tableId: string;
  abstract readonly storeSort?: boolean;
  abstract readonly storeSearch?: boolean;
  abstract readonly storePagination?: boolean;
}
