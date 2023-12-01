import { inject, Injectable } from '@angular/core';
import { AutomationPackage, AutomationPackagesService, ExecutiontTaskParameters } from '../../generated';
import {
  StepDataSource,
  TableApiWrapperService,
  TableCollectionFilter,
  TableRemoteDataSourceFactoryService,
} from '../../table/step-table-client.module';
import { map, Observable } from 'rxjs';
import { CompareCondition } from '../../../modules/basics/shared/compare-condition.enum';
import { HttpClient } from '@angular/common/http';
import { uploadWithProgress } from '../shared/pipe-operators';

const AUTOMATION_PACKAGE_TABLE_ID = 'automationPackages';

@Injectable({
  providedIn: 'root',
})
export class AugmentedAutomationPackagesService extends AutomationPackagesService {
  private _http = inject(HttpClient);
  private _tableRest = inject(TableApiWrapperService);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  createDataSource(): StepDataSource<AutomationPackage> {
    return this._dataSourceFactory.createDataSource(AUTOMATION_PACKAGE_TABLE_ID, {
      name: 'attributes.name',
      fileName: 'customFields.automationPackageFileName',
      actions: '',
    });
  }

  searchByIDs(ids: string[]): Observable<AutomationPackage[]> {
    const idsFilter: TableCollectionFilter = {
      collectionFilter: {
        type: CompareCondition.OR,
        children: ids.map((expectedValue) => ({
          type: CompareCondition.EQUALS,
          field: 'id',
          expectedValue,
        })),
      },
    };

    return this._tableRest
      .requestTable<ExecutiontTaskParameters>(AUTOMATION_PACKAGE_TABLE_ID, { filters: [idsFilter] })
      .pipe(map((response) => response.data));
  }

  uploadAutomationPackage(file: File): ReturnType<typeof uploadWithProgress> {
    const body = new FormData();
    body.set('file', file);

    const request$ = this._http.request('POST', `/rest/automation-packages`, {
      body,
      headers: {
        enctype: 'multipart/form-data',
      },
      observe: 'events',
      responseType: 'arraybuffer',
      reportProgress: true,
    });

    return uploadWithProgress(request$);
  }
}
