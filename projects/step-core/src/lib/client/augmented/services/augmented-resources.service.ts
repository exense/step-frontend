import { HttpClient, HttpEventType, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { filter, Observable, of, shareReplay, switchMap } from 'rxjs';
import { Resource, ResourcesService, ResourceUploadResponse } from '../../generated';
import { TableRemoteDataSourceFactoryService, StepDataSource } from '../../table/step-table-client.module';

@Injectable({ providedIn: 'root' })
export class AugmentedResourcesService extends ResourcesService {
  private readonly RESOURCES_TABLE_ID = 'resources';

  private _httpClient = inject(HttpClient);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  createDataSource(): StepDataSource<Resource> {
    return this._dataSourceFactory.createDataSource(this.RESOURCES_TABLE_ID, {
      name: 'attributes.name',
      resourceType: 'resourceType',
      id: 'id',
    });
  }

  createSelectionDataSource(): StepDataSource<Resource> {
    return this._dataSourceFactory.createDataSource(this.RESOURCES_TABLE_ID, {
      id: 'id',
      resourceName: 'resourceName',
      resourceType: 'resourceType',
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
      .request('POST', `rest/resources${resourceId ? `/${resourceId}` : ''}/content`, {
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
    return `rest/resources/${resourceId}/content`;
  }

  downloadResource(resourceId: string, fileName: string) {
    const url = this.getDownloadResourceUrl(resourceId);
    fetch(url, { method: 'get' })
      .then((res) => res.blob())
      .then((res) => {
        const aElement = document.createElement('a');
        aElement.setAttribute('download', fileName);
        const href = URL.createObjectURL(res);
        aElement.href = href;
        aElement.setAttribute('target', '_blank');
        aElement.click();
        URL.revokeObjectURL(href);
      });
  }

  private calculateProgressPercentage(httpProgressEvent: HttpProgressEvent) {
    return httpProgressEvent.total ? Math.round((100 * httpProgressEvent.loaded) / httpProgressEvent.total) : 0;
  }

  private decodeArrayBuffer<T>(arrayBuffer: ArrayBuffer): T {
    return JSON.parse(String.fromCharCode.apply(null, Array.from(new Uint8Array(arrayBuffer))));
  }
}
