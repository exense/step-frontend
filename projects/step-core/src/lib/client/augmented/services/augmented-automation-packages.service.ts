import { inject, Injectable } from '@angular/core';
import { AutomationPackage, AutomationPackagesService, ExecutiontTaskParameters } from '../../generated';
import {
  StepDataSource,
  TableApiWrapperService,
  TableCollectionFilter,
  TableRemoteDataSourceFactoryService,
} from '../../table/step-table-client.module';
import { map, Observable, of, OperatorFunction } from 'rxjs';
import { CompareCondition } from '../../../modules/basics/types/compare-condition.enum';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { uploadWithProgress } from '../shared/pipe-operators';
import { catchError } from 'rxjs/operators';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';

@Injectable({
  providedIn: 'root',
})
export class AugmentedAutomationPackagesService
  extends AutomationPackagesService
  implements HttpOverrideResponseInterceptor
{
  static readonly AUTOMATION_PACKAGE_TABLE_ID = 'automationPackages';

  private _http = inject(HttpClient);
  private _tableRest = inject(TableApiWrapperService);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  createDataSource(): StepDataSource<AutomationPackage> {
    return this._dataSourceFactory.createDataSource(AugmentedAutomationPackagesService.AUTOMATION_PACKAGE_TABLE_ID, {
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
      .requestTable<ExecutiontTaskParameters>(AugmentedAutomationPackagesService.AUTOMATION_PACKAGE_TABLE_ID, {
        filters: [idsFilter],
      })
      .pipe(map((response) => response.data));
  }

  searchPackageIDsByName(packageName: string): Observable<string[]> {
    return this._tableRest
      .requestTable<AutomationPackage>(AugmentedAutomationPackagesService.AUTOMATION_PACKAGE_TABLE_ID, {
        filters: [
          {
            field: 'attributes.name',
            value: packageName,
            regex: true,
          },
        ],
      })
      .pipe(
        map((response) => response?.data ?? []),
        map((packages) => packages.map((item) => item.id).filter((id) => !!id) as string[]),
        catchError((err) => {
          console.log(err);
          return of([]);
        }),
      );
  }

  uploadCreateAutomationPackage(file: File): ReturnType<typeof uploadWithProgress> {
    const body = new FormData();
    body.set('file', file);

    const request$ = this._http.request(
      'POST',
      `rest/automation-packages`,
      this._requestContextHolder.decorateRequestOptions({
        body,
        headers: {
          enctype: 'multipart/form-data',
        },
        observe: 'events',
        responseType: 'arraybuffer',
        reportProgress: true,
      }),
    );

    return uploadWithProgress(request$);
  }

  uploadUpdateAutomationPackage(id: string, file: File): ReturnType<typeof uploadWithProgress> {
    const body = new FormData();
    body.set('file', file);

    const request$ = this._http.request(
      'PUT',
      `rest/automation-packages/${id}?async=true`,
      this._requestContextHolder.decorateRequestOptions({
        body,
        headers: {
          enctype: 'multipart/form-data',
        },
        observe: 'events',
        responseType: 'arraybuffer',
        reportProgress: true,
      }),
    );

    return uploadWithProgress(request$);
  }
}
