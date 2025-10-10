import { inject, Injectable } from '@angular/core';
import { AutomationPackage, AutomationPackagesService, ExecutiontTaskParameters } from '../../generated';
import {
  StepDataSource,
  TableApiWrapperService,
  TableCollectionFilter,
  TableRemoteDataSourceFactoryService,
} from '../../table';
import { map, Observable, of, OperatorFunction, tap } from 'rxjs';
import { CompareCondition } from '../../../modules/basics/types/compare-condition.enum';
import { HttpClient, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { uploadWithProgress } from '../shared/pipe-operators';
import { catchError } from 'rxjs/operators';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';

export interface AutomationPackageParams {
  id?: string;
  file?: File;
  mavenSnippet?: string;
  version?: string;
  activationExpression?: string;
}

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

  private cachedAutomationPackage?: AutomationPackage;

  clearCache(): void {
    this.cachedAutomationPackage = undefined;
  }

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

  getAutomationPackageCached(id: string): Observable<AutomationPackage> {
    if (this.cachedAutomationPackage && this.cachedAutomationPackage.id === id) {
      return of(this.cachedAutomationPackage);
    }
    return super.getAutomationPackage(id).pipe(
      tap((automationPackage) => {
        this.cachedAutomationPackage = automationPackage;
      }),
    );
  }

  automationPackageCreateOrUpdate({
    id,
    file,
    version,
    activationExpression,
    mavenSnippet,
  }: AutomationPackageParams): ReturnType<typeof uploadWithProgress> {
    const method = !!id ? 'PUT' : 'POST';
    let url = 'rest/automation-packages';
    if (!!id) {
      url = `${url}/${id}`;
    }
    if (!!mavenSnippet) {
      url = `${url}/mvn`;
    }

    let body: FormData | string;
    if (mavenSnippet) {
      body = mavenSnippet;
    } else {
      body = new FormData();
      body.set('file', file!);
    }

    let headers: HttpHeaders;
    if (typeof body === 'string') {
      headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    } else {
      headers = new HttpHeaders({ enctype: 'multipart/form-data' });
    }

    let params = new HttpParams().set('async', true);
    if (version) {
      params = params.set('version', version);
    }
    if (activationExpression) {
      params = params.set('activationExpr', activationExpression);
    }

    const request$ = this._http.request(
      method,
      url,
      this._requestContextHolder.decorateRequestOptions({
        headers,
        body,
        params,
        observe: 'events',
        responseType: 'arraybuffer',
        reportProgress: true,
      }),
    );

    return uploadWithProgress(request$);
  }
}
