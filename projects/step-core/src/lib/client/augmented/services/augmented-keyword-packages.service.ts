import { FunctionPackage, KeywordPackagesService } from '../../generated';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  StepDataSource,
  TableRemoteDataSourceFactoryService,
  TableApiWrapperService,
} from '../../table/step-table-client.module';

const FUNCTION_PACKAGE_TABLE_ID = 'functionPackage';

@Injectable({
  providedIn: 'root',
})
export class AugmentedKeywordPackagesService extends KeywordPackagesService {
  private _tableRest = inject(TableApiWrapperService);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  createDataSource(): StepDataSource<FunctionPackage> {
    return this._dataSourceFactory.createDataSource(FUNCTION_PACKAGE_TABLE_ID, {
      name: 'attributes.name',
      version: 'packageAttributes.version',
      actions: '',
    });
  }

  createSelectionDataSource(): StepDataSource<FunctionPackage> {
    return this._dataSourceFactory.createDataSource(FUNCTION_PACKAGE_TABLE_ID, {
      'attributes.name': 'attributes.name',
      packageLocation: 'packageLocation',
      'packageAttributes.version': 'packageAttributes.version',
    });
  }

  searchPackageIDsByName(packageName: string): Observable<string[]> {
    return this._tableRest
      .requestTable<FunctionPackage>(FUNCTION_PACKAGE_TABLE_ID, {
        filters: [
          {
            field: 'attributes.name',
            value: packageName,
            regex: true,
          },
        ],
      })
      .pipe(
        map((response) => response?.data || []),
        map((packages) =>
          packages.map((functionPackage) => functionPackage.id || '').filter((packageId) => !!packageId)
        ),
        catchError((err) => {
          console.error(err);
          return of([]);
        })
      );
  }
}
