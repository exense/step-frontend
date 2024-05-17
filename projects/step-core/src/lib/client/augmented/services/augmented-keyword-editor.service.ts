import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable, OperatorFunction } from 'rxjs';
import { KeywordEditorService } from '../../generated';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';

@Injectable({
  providedIn: 'root',
})
export class AugmentedKeywordEditorService extends KeywordEditorService implements HttpOverrideResponseInterceptor {
  private _httpClient = inject(HttpClient);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  override getFunctionScript(functionId: string): Observable<string> {
    return this._httpClient.get(
      `rest/scripteditor/function/${functionId}/file`,
      this._requestContextHolder.decorateRequestOptions({ responseType: 'text' }),
    );
  }

  override saveFunctionScript(functionId: string, requestBody?: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this._httpClient.post(
      `rest/scripteditor/function/${functionId}/file`,
      requestBody,
      this._requestContextHolder.decorateRequestOptions({ headers }),
    );
  }
}
