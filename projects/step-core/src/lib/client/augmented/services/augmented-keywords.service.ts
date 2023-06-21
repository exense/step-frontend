import { inject, Injectable } from '@angular/core';
import { Execution, Function as KeywordFunction, KeywordsService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';

@Injectable({ providedIn: 'root' })
export class AugmentedKeywordsService extends KeywordsService {
  private readonly FUNCTIONS_TABLE_ID = 'functions';
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  createFilteredTableDataSource(filter?: string[]): StepDataSource<KeywordFunction> {
    return this._dataSourceFactory.createDataSource(
      this.FUNCTIONS_TABLE_ID,
      {
        name: 'attributes.name',
        type: 'type',
        actions: '',
      },
      filter ? { type: filter } : undefined
    );
  }

  getKeywordSelectionTableDataSource(): StepDataSource<Execution> {
    return this._dataSourceFactory.createDataSource(this.FUNCTIONS_TABLE_ID, { name: 'attributes.name', type: 'type' });
  }
}
