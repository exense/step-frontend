import { inject, Injectable } from '@angular/core';
import { QuotaManagerService } from '../../generated';
import { Observable, OperatorFunction } from 'rxjs';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';

@Injectable({
  providedIn: 'root',
})
export class AugmentedQuotaManagerService extends QuotaManagerService implements HttpOverrideResponseInterceptor {
  private _httpClient = inject(HttpClient);

  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  override getQuotaManagerStatus(): Observable<string> {
    return this._httpClient.get(
      'rest/quotamanager/status',
      this._requestContextHolder.decorateRequestOptions({ responseType: 'text' }),
    );
  }
}
