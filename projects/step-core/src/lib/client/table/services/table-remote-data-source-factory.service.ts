import { SearchValue } from '../../../modules/table/shared/search-value';
import { TableDataSource } from '../../../modules/table/shared/table-data-source';

export abstract class TableRemoteDataSourceFactoryService {
  abstract createDataSource<T>(
    tableId: string,
    requestColumnsMap: Record<string, string | string[]>,
    filters?: Record<string, string | string[] | SearchValue>,
    options?: { includeGlobalEntities?: boolean },
  ): TableDataSource<T>;
}
