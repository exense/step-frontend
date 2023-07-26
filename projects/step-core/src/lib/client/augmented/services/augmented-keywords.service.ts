import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Execution, Function as KeywordFunction, KeywordsService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';

const FUNCTIONS_TABLE_ID = 'functions';

@Injectable({ providedIn: 'root' })
export class AugmentedKeywordsService extends KeywordsService {
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _httpClient = inject(HttpClient);

  createFilteredTableDataSource(filter?: string[]): StepDataSource<KeywordFunction> {
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

  override newFunctionTypeConf(type: string): Observable<KeywordFunction>;
  /**
   * @deprecated
   */
  override newFunctionTypeConf(type: string, serviceRoot: string): Observable<KeywordFunction>;
  override newFunctionTypeConf(type: string, serviceRoot?: string): Observable<KeywordFunction> {
    const root = serviceRoot ?? 'functions';

    return this.httpRequest.request({
      method: 'GET',
      url: `/${root}/types/${type}`,
    });
  }

  override saveFunction(requestBody?: KeywordFunction): Observable<KeywordFunction>;
  /**
   * @deprecated
   */
  override saveFunction(requestBody?: KeywordFunction, serviceRoot?: string): Observable<KeywordFunction>;
  override saveFunction(requestBody?: KeywordFunction, serviceRoot?: string): Observable<KeywordFunction> {
    const root = serviceRoot ?? 'functions';

    return this.httpRequest.request({
      method: 'POST',
      url: `/${root}`,
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  override getFunctionEditor(id: string): Observable<string> {
    return this._httpClient.request('GET', `/rest/functions/${id}/editor`, {
      responseType: 'text',
    });
  }
}
