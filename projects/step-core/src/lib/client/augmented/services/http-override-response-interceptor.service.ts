import { inject, Injectable } from '@angular/core';
import { OperatorFunction } from 'rxjs';
import { HttpContext, HttpContextToken, HttpEvent } from '@angular/common/http';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';

export const OVERRIDE_INTERCEPTOR_ID = new HttpContextToken<
  OperatorFunction<HttpEvent<any>, HttpEvent<any>> | undefined
>(() => undefined);

@Injectable({
  providedIn: 'root',
})
export class HttpOverrideResponseInterceptorService implements HttpOverrideResponseInterceptor {
  private _contextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    const context = new HttpContext().set(OVERRIDE_INTERCEPTOR_ID, override);
    this._contextHolder.addContextToUpcomingRequest(context);
    return this;
  }
}
