import { FunctionPackage, KeywordPackagesService } from '../../generated';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, OperatorFunction, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StepDataSource, TableRemoteDataSourceFactoryService, TableApiWrapperService } from '../../table';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { HttpEvent } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AugmentedKeywordPackagesService extends KeywordPackagesService implements HttpOverrideResponseInterceptor {
  private _tableRest = inject(TableApiWrapperService);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  private functionPackagedCached?: FunctionPackage;

  static readonly FUNCTION_PACKAGE_TABLE_ID = 'functionPackage';

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  createDataSource(): StepDataSource<FunctionPackage> {
    return this._dataSourceFactory.createDataSource(AugmentedKeywordPackagesService.FUNCTION_PACKAGE_TABLE_ID, {
      name: 'attributes.name',
      version: 'packageAttributes.version',
      actions: '',
    });
  }

  createSelectionDataSource(): StepDataSource<FunctionPackage> {
    return this._dataSourceFactory.createDataSource(AugmentedKeywordPackagesService.FUNCTION_PACKAGE_TABLE_ID, {
      'attributes.name': 'attributes.name',
      packageLocation: 'packageLocation',
      'packageAttributes.version': 'packageAttributes.version',
    });
  }

  searchPackageIDsByName(packageName: string): Observable<string[]> {
    return this._tableRest
      .requestTable<FunctionPackage>(AugmentedKeywordPackagesService.FUNCTION_PACKAGE_TABLE_ID, {
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
          packages.map((functionPackage) => functionPackage.id || '').filter((packageId) => !!packageId),
        ),
        catchError((err) => {
          console.error(err);
          return of([]);
        }),
      );
  }

  getFunctionPackageCached(id: string): Observable<FunctionPackage> {
    if (this.functionPackagedCached && this.functionPackagedCached.id === id) {
      return of(this.functionPackagedCached);
    }
    return super.getFunctionPackage(id).pipe(tap((functionPackage) => (this.functionPackagedCached = functionPackage)));
  }

  cleanupCache(): void {
    this.functionPackagedCached = undefined;
  }
}
