import { ExecutionParameters, InteractivePlanExecutionService } from '../../generated';
import { Observable, OperatorFunction } from 'rxjs';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';

@Injectable({
  providedIn: 'root',
})
export class AugmentedInteractivePlanExecutionService
  extends InteractivePlanExecutionService
  implements HttpOverrideResponseInterceptor
{
  private _httpClient = inject(HttpClient);

  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  override startInteractiveSession(requestBody?: ExecutionParameters): Observable<string> {
    return this._httpClient.post(
      'rest/interactive/start',
      requestBody,
      this._requestContextHolder.decorateRequestOptions({ responseType: 'text' }),
    );
  }
}
