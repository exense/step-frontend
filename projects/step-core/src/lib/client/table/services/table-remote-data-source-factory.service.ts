import { StepDataSource } from '../shared/step-data-source';

export abstract class TableRemoteDataSourceFactoryService {
  abstract createDataSource<T>(
    tableId: string,
    requestColumnsMap: Record<string, string>,
    filters?: Record<string, string[]>
  ): StepDataSource<T>;
}
