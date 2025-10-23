import { HttpClient, HttpEvent } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, OperatorFunction, tap } from 'rxjs';
import {
  AsyncTaskStatusTableBulkOperationReport,
  Resource,
  ResourcesService,
  ResourceUploadResponse,
  TableBulkOperationRequest,
} from '../../generated';
import { TableRemoteDataSourceFactoryService, StepDataSource } from '../../table';
import { uploadWithProgress } from '../shared/pipe-operators';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { downloadFile } from '../shared/download-file';
import { extendTableBulkOperationRequest } from '../shared/extend-table-bulk-operation-request';

@Injectable({ providedIn: 'root' })
export class AugmentedResourcesService extends ResourcesService implements HttpOverrideResponseInterceptor {
  static readonly RESOURCES_TABLE_ID = 'resources';

  private _httpClient = inject(HttpClient);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  private cachedResource?: Resource;

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  createDataSource(): StepDataSource<Resource> {
    return this._dataSourceFactory.createDataSource(AugmentedResourcesService.RESOURCES_TABLE_ID, {
      name: 'attributes.name',
      resourceType: 'resourceType',
      id: 'id',
      automationPackage: 'customFields.automationPackageId',
    });
  }

  createSelectionDataSource(): StepDataSource<Resource> {
    return this._dataSourceFactory.createDataSource(AugmentedResourcesService.RESOURCES_TABLE_ID, {
      id: 'id',
      resourceName: 'resourceName',
      resourceType: 'resourceType',
    });
  }

  override bulkDelete1(
    requestBody?: TableBulkOperationRequest,
    filter?: string,
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return super.bulkDelete1(extendTableBulkOperationRequest(requestBody, filter));
  }

  /**
   * Upload a resource while keeping track of the progress
   * @note $progress and $response are hot observables, we have to make sure to unsubscribe from them
   */
  createResourceWithProgress({
    file,
    queryParams: { type, duplicateCheck, directory },
    resourceId,
  }: {
    file: File;
    queryParams: {
      type: string;
      duplicateCheck: boolean;
      directory: boolean;
    };
    resourceId?: string;
  }): {
    progress$: Observable<number>;
    response$: Observable<ResourceUploadResponse>;
  } {
    const formData = new FormData();

    formData.set('file', file);

    const request$ = this._httpClient.request(
      'POST',
      `rest/resources${resourceId ? `/${resourceId}` : ''}/content`,
      this._requestContextHolder.decorateRequestOptions({
        body: formData,
        params: {
          type,
          duplicateCheck,
          directory,
        },
        headers: {
          enctype: 'multipart/form-data',
        },
        observe: 'events',
        responseType: 'arraybuffer',
        reportProgress: true,
      }),
    );

    const { progress$, response$: responseString$ } = uploadWithProgress(request$);
    const response$ = responseString$.pipe(
      map((responseString) => JSON.parse(responseString) as ResourceUploadResponse),
    );
    return { progress$, response$ };
  }

  getDownloadResourceUrl(resourceId: string, inline?: boolean): string {
    let result = `rest/resources/${resourceId}/content`;
    if (inline) {
      result = `${result}?inline=true`;
    }
    return result;
  }

  getResourceContentAsText(id: string): Observable<string> {
    return this._httpClient.get(
      `rest/resources/${id}/content`,
      this._requestContextHolder.decorateRequestOptions({
        responseType: 'text',
        params: {
          inline: true,
        },
      }),
    );
  }

  downloadResource(resourceId: string, fileName: string) {
    const url = this.getDownloadResourceUrl(resourceId);
    downloadFile(url, fileName);
  }

  getResourceCached(id: string): Observable<Resource> {
    if (this.cachedResource && this.cachedResource.id === id) {
      return of(this.cachedResource);
    }
    return super.getResource(id).pipe(tap((resource) => (this.cachedResource = resource)));
  }

  cleanupCache(): void {
    this.cachedResource = undefined;
  }
}
