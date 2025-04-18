import { HttpClient, HttpEvent } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, OperatorFunction, tap } from 'rxjs';
import { Execution, KeywordsService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table';
import { Keyword } from '../shared/keyword';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';

@Injectable({ providedIn: 'root' })
export class AugmentedKeywordsService extends KeywordsService implements HttpOverrideResponseInterceptor {
  static readonly FUNCTIONS_TABLE_ID = 'functions';

  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _httpClient = inject(HttpClient);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  private cachedKeyword?: Keyword;

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  createFilteredTableDataSource(filter?: string[]): StepDataSource<Keyword> {
    return this._dataSourceFactory.createDataSource(
      AugmentedKeywordsService.FUNCTIONS_TABLE_ID,
      {
        name: 'attributes.name',
        type: 'type',
        automationPackage: 'customFields.automationPackageId',
        actions: '',
      },
      filter ? { type: filter } : undefined,
    );
  }

  getKeywordSelectionTableDataSource(): StepDataSource<Execution> {
    return this._dataSourceFactory.createDataSource(
      AugmentedKeywordsService.FUNCTIONS_TABLE_ID,
      this._requestContextHolder.decorateRequestOptions({
        name: 'attributes.name',
        type: 'type',
      }),
    );
  }

  override getFunctionEditor(id: string): Observable<string> {
    return this._httpClient.request(
      'GET',
      `rest/functions/${id}/editor`,
      this._requestContextHolder.decorateRequestOptions({
        responseType: 'text',
      }),
    );
  }

  getFunctionByIdCached(id: string): Observable<Keyword> {
    if (this.cachedKeyword && this.cachedKeyword.id === id) {
      return of(this.cachedKeyword);
    }
    return super.getFunctionById(id).pipe(tap((keyword) => (this.cachedKeyword = keyword)));
  }

  cleanupCache(): void {
    this.cachedKeyword = undefined;
  }
}
