import { HttpClient, HttpEventType, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, Observable, of, shareReplay, switchMap } from 'rxjs';
import { TableRemoteDataSource } from '../../../modules/table/shared/table-remote-data-source';
import { Resource, ResourcesService, ResourceUploadResponse } from '../../generated';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { TableApiWrapperService } from '../../table/services/table-api-wrapper.service';
import { TableDataSource } from '../../../modules/table/shared/table-data-source';

@Injectable({ providedIn: 'root' })
export class AugmentedResourcesService extends ResourcesService {
  private readonly RESOURCES_TABLE_ID = 'resources';

  constructor(
    public _httpRequest: BaseHttpRequest,
    public _tableRest: TableApiWrapperService,
    public _httpClient: HttpClient
  ) {
    super(_httpRequest);
  }

  createDatasource(): TableDataSource<Resource> {
    return new TableRemoteDataSource(this.RESOURCES_TABLE_ID, this._tableRest, {
      name: 'attributes.name',
      resourceType: 'resourceType',
      id: 'id',
    });
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

    const stream$ = this._httpClient
      .request('POST', `/rest/resources${resourceId ? `/${resourceId}` : ''}/content`, {
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
      })
      .pipe(shareReplay());

    const progress$ = stream$.pipe(
      filter((httpEvent) => httpEvent.type === HttpEventType.UploadProgress),
      switchMap((httpEvent) => {
        const httpProgressEvent = httpEvent as HttpProgressEvent;

        const progressPercentage = this.calculateProgressPercentage(httpProgressEvent);

        return of(progressPercentage);
      })
    );

    const response$ = stream$.pipe(
      filter((httpEvent) => httpEvent.type === HttpEventType.Response),
      switchMap((httpEvent) => {
        const httpResponse = httpEvent as HttpResponse<ArrayBuffer>;

        if (!httpResponse.body) {
          return of();
        }

        const resourceUploadResponse = this.decodeArrayBuffer<ResourceUploadResponse>(httpResponse.body);

        return of(resourceUploadResponse);
      })
    );

    return {
      progress$,
      response$,
    };
  }

  getDownloadResourceUrl(resourceId: string): string {
    return `/rest/resources/${resourceId}/content`;
  }

  private calculateProgressPercentage(httpProgressEvent: HttpProgressEvent) {
    return httpProgressEvent.total ? Math.round((100 * httpProgressEvent.loaded) / httpProgressEvent.total) : 0;
  }

  private decodeArrayBuffer<T>(arrayBuffer: ArrayBuffer): T {
    return JSON.parse(String.fromCharCode.apply(null, Array.from(new Uint8Array(arrayBuffer))));
  }
}
