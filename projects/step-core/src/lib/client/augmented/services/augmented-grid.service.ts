import { inject, Injectable } from '@angular/core';
import { GridService } from '../../generated';
import { Observable, OperatorFunction } from 'rxjs';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { HttpEvent } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AugmentedGridService extends GridService implements HttpOverrideResponseInterceptor {
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  /**
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public override startTokenMaintenance(id: string): Observable<any> {
    return this.httpRequest.request(
      this._requestContextHolder.decorateRequestOptions({
        method: 'POST',
        url: '/grid/token/{id}/maintenance',
        path: {
          id: id,
        },
      }),
    );
  }

  /**
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public override stopTokenMaintenance(id: string): Observable<any> {
    return this.httpRequest.request(
      this._requestContextHolder.decorateRequestOptions({
        method: 'DELETE',
        url: '/grid/token/{id}/maintenance',
        path: {
          id: id,
        },
      }),
    );
  }
}
