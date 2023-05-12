import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';
import { Function, KeywordsService } from '../../generated';
import { TableApiWrapperService } from '../../table/services/table-api-wrapper.service';

@Injectable({ providedIn: 'root' })
export class AugmentedKeywordsService extends KeywordsService {
  private _tableRest = inject(TableApiWrapperService);

  createFilteredTableDataSource(filter?: string[]): TableRemoteDataSource<Function> {
    return new TableRemoteDataSource<Function>(
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

  override newFunctionTypeConf(type: string): Observable<Function>;
  override newFunctionTypeConf(type: string, serviceRoot: string): Observable<Function>;
  override newFunctionTypeConf(type: string, serviceRoot?: string): Observable<Function> {
    return this.httpRequest.request({
      method: 'GET',
      url: `/${serviceRoot}/types/${type}`,
    });
  }

  override saveFunction(requestBody?: Function): Observable<Function>;
  override saveFunction(requestBody?: Function, serviceRoot?: string): Observable<Function>;
  override saveFunction(requestBody?: Function, serviceRoot?: string): Observable<Function> {
    return this.httpRequest.request({
      method: 'POST',
      url: `/${serviceRoot}`,
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  override getFunctionEditor(id: string): Observable<string> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/functions/{id}/editor',
      path: {
        id: id,
      },
      headers: {
        Accept: 'application/json, text/plain, */*',
      },
    });
  }
}
