import { inject, Injectable } from '@angular/core';
import { AutomationPackage, AutomationPackagesService, ExecutiontTaskParameters, Plan } from '../../generated';
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
import { Keyword } from '../shared/keyword';

export interface AutomationPackageParams {
  id?: string;
  apFile?: File;
  apMavenSnippet?: string;
  apResourceId?: string;
  apLibrary?: File;
  apLibraryMavenSnippet?: string;
  apLibraryResourceId?: string;
  version?: string;
  activationExpression?: string;
  allowUpdateOfOtherPackages?: boolean;
  plansAttributes?: Partial<Plan>;
  functionsAttributes?: Partial<Keyword>;
  tokenSelectionCriteria?: any;
  executeFunctionsLocally?: boolean;
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
      libraryName: 'automationPackageLibraryResourceObj.attributes.name',
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
    apFile,
    apMavenSnippet,
    apResourceId,
    version,
    activationExpression,
    apLibrary,
    apLibraryMavenSnippet,
    apLibraryResourceId,
    allowUpdateOfOtherPackages,
    plansAttributes,
    functionsAttributes,
    tokenSelectionCriteria,
    executeFunctionsLocally,
  }: AutomationPackageParams): ReturnType<typeof uploadWithProgress> {
    const method = !!id ? 'PUT' : 'POST';
    let url = 'rest/automation-packages';
    if (!!id) {
      url = `${url}/${id}`;
    }

    let body: FormData | string;
    body = new FormData();

    if (apFile) {
      body.set('file', apFile!);
    } else if (apMavenSnippet) {
      body.set('apMavenSnippet', apMavenSnippet);
    } else if (apResourceId) {
      body.set('apResourceId', apResourceId);
    }

    if (apLibrary) {
      body.set('apLibrary', apLibrary!);
    } else if (apLibraryMavenSnippet) {
      body.set('apLibraryMavenSnippet', apLibraryMavenSnippet);
    } else if (apLibraryResourceId) {
      body.set('apLibraryResourceId', apLibraryResourceId);
    }

    if (plansAttributes?.attributes) {
      body.set('plansAttributes', JSON.stringify(plansAttributes!.attributes));
    }
    if (functionsAttributes?.attributes) {
      body.set('functionsAttributes', JSON.stringify(functionsAttributes!.attributes));
    }
    if (tokenSelectionCriteria && !executeFunctionsLocally) {
      body.set('tokenSelectionCriteria', JSON.stringify(tokenSelectionCriteria));
    }
    if (executeFunctionsLocally) {
      body.set('executeFunctionsLocally', JSON.stringify(executeFunctionsLocally));
    }

    if (version) {
      body.set('version', version);
    }
    if (activationExpression) {
      body.set('activationExpr', activationExpression);
    }
    if (allowUpdateOfOtherPackages) {
      body.set('allowUpdateOfOtherPackages', 'true');
    }

    let headers: HttpHeaders;
    headers = new HttpHeaders({ enctype: 'multipart/form-data' });

    const request$ = this._http.request(
      method,
      url,
      this._requestContextHolder.decorateRequestOptions({
        headers,
        body,
        observe: 'events',
        responseType: 'arraybuffer',
        reportProgress: true,
      }),
    );

    return uploadWithProgress(request$);
  }
}
