import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Resource, ResourcesService, ResourceUploadResponse } from '../../generated';
import { TableRemoteDataSourceFactoryService, StepDataSource } from '../../table/step-table-client.module';
import { uploadWithProgress } from '../shared/pipe-operators';

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
      automationPackage: 'customFields.automationPackageId',
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

    const request$ = this._httpClient.request('POST', `rest/resources${resourceId ? `/${resourceId}` : ''}/content`, {
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
    });

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
}
