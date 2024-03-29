import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Execution, KeywordsService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';
import { Keyword } from '../shared/keyword';

const FUNCTIONS_TABLE_ID = 'functions';

@Injectable({ providedIn: 'root' })
export class AugmentedKeywordsService extends KeywordsService {
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _httpClient = inject(HttpClient);

  private cachedKeyword?: Keyword;

  createFilteredTableDataSource(filter?: string[]): StepDataSource<Keyword> {
    return this._dataSourceFactory.createDataSource(
      FUNCTIONS_TABLE_ID,
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
    return this._dataSourceFactory.createDataSource(FUNCTIONS_TABLE_ID, { name: 'attributes.name', type: 'type' });
  }

  override getFunctionEditor(id: string): Observable<string> {
    return this._httpClient.request('GET', `rest/functions/${id}/editor`, {
      responseType: 'text',
    });
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
