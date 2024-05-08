import { SettingsService } from '../../generated';
import { inject, Injectable } from '@angular/core';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable, OperatorFunction } from 'rxjs';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';

@Injectable({
  providedIn: 'root',
})
export class AugmentedSettingsService extends SettingsService implements HttpOverrideResponseInterceptor {
  private _http = inject(HttpClient);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  override getSetting<T>(id: string): Observable<T> {
    return this._http.get<T>(`rest/settings/${id}`);
  }

  getSettingAsText(id: string): Observable<string> {
    return this._http.request(
      'GET',
      `rest/settings/${id}`,
      this._requestContextHolder.decorateRequestOptions({ responseType: 'text' }),
    );
  }

  /*
    Enforcing application/json headers
   */
  override saveSetting<T>(id: string, requestBody?: any): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return this._http.post<T>(
      `rest/settings/${id}`,
      requestBody,
      this._requestContextHolder.decorateRequestOptions({ headers }),
    );
  }
}
