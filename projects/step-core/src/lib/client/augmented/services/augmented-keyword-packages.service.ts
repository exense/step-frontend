import { FunctionPackage, KeywordPackagesService } from '../../generated';
import { Injectable } from '@angular/core';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableApiWrapperService } from '../../table/services/table-api-wrapper.service';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';
import { map, Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

const FUNCTION_PACKAGE_TABLE_ID = 'functionPackage';

@Injectable({
  providedIn: 'root',
})
export class AugmentedKeywordPackagesService extends KeywordPackagesService {
  readonly dataSource = new TableRemoteDataSource<FunctionPackage>(FUNCTION_PACKAGE_TABLE_ID, this._tableRest, {
    name: 'attributes.name',
    version: 'packageAttributes.version',
    actions: '',
  });

  constructor(httpRequest: BaseHttpRequest, private _tableRest: TableApiWrapperService) {
    super(httpRequest);
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
