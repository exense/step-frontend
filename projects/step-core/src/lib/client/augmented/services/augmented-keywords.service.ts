import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Execution, KeywordsService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';
import { Keyword } from '../shared/keyword';

const FUNCTIONS_TABLE_ID = 'functions';

@Injectable({ providedIn: 'root' })
export class AugmentedKeywordsService extends KeywordsService {
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _httpClient = inject(HttpClient);

  createFilteredTableDataSource(filter?: string[]): StepDataSource<Keyword> {
    return this._dataSourceFactory.createDataSource(
      FUNCTIONS_TABLE_ID,
      {
        name: 'attributes.name',
        type: 'type',
        actions: '',
      },
      filter ? { type: filter } : undefined
    );
  }

  getKeywordSelectionTableDataSource(): StepDataSource<Execution> {
    return this._dataSourceFactory.createDataSource(FUNCTIONS_TABLE_ID, { name: 'attributes.name', type: 'type' });
  }

  override getFunctionEditor(id: string): Observable<string> {
    return this._httpClient.request('GET', `rest/functions/${id}/editor`, {
      responseType: 'text',
    });
  }
}
