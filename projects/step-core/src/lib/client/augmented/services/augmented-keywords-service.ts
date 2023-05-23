import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';
import { Function as Keyword, KeywordsService } from '../../generated';
import { TableApiWrapperService } from '../../table/services/table-api-wrapper.service';

@Injectable({ providedIn: 'root' })
export class AugmentedKeywordsService extends KeywordsService {
  private _tableRest = inject(TableApiWrapperService);
  private _httpClient = inject(HttpClient);

  createFilteredTableDataSource(filter?: string[]): TableRemoteDataSource<Keyword> {
    return new TableRemoteDataSource<Keyword>(
      'functions',
      this._tableRest,
      {
        name: 'attributes.name',
        type: 'type',
        actions: '',
      },
      filter ? { type: filter } : undefined
    );
  }

  override newFunctionTypeConf(type: string): Observable<Keyword>;
  /**
   * @deprecated
   */
  override newFunctionTypeConf(type: string, serviceRoot: string): Observable<Keyword>;
  override newFunctionTypeConf(type: string, serviceRoot?: string): Observable<Keyword> {
    return this.httpRequest.request({
      method: 'GET',
      url: `/${serviceRoot}/types/${type}`,
    });
  }

  override saveFunction(requestBody?: Keyword): Observable<Keyword>;
  /**
   * @deprecated
   */
  override saveFunction(requestBody?: Keyword, serviceRoot?: string): Observable<Keyword>;
  override saveFunction(requestBody?: Keyword, serviceRoot?: string): Observable<Keyword> {
    return this.httpRequest.request({
      method: 'POST',
      url: `/${serviceRoot}`,
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
