import { inject, Injectable } from '@angular/core';
import { OperatorFunction } from 'rxjs';
import { HttpEvent } from '@angular/common/http';
import { downloadFile } from '../shared/download-file';
import { StreamingResourcesService } from '../../generated';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';

@Injectable({
  providedIn: 'root',
})
export class AugmentedStreamingResourcesService
  extends StreamingResourcesService
  implements HttpOverrideResponseInterceptor
{
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  getDownloadResourceUrl(resourceId: string, inline?: boolean): string {
    let result = `rest/streaming-resources/${resourceId}/download`;
    if (inline) {
      result = `${result}?inline=true`;
    }
    return result;
  }

  downloadResource(resourceId: string, fileName: string): void {
    const url = this.getDownloadResourceUrl(resourceId);
    downloadFile(url, fileName);
  }
}
