import { StepDataSource } from '../shared/step-data-source';
import { SearchValue } from '../../../modules/table/shared/search-value';

export abstract class TableRemoteDataSourceFactoryService {
  abstract createDataSource<T>(
    tableId: string,
    requestColumnsMap: Record<string, string>,
    filters?: Record<string, string | string[] | SearchValue>,
  ): StepDataSource<T>;
}
