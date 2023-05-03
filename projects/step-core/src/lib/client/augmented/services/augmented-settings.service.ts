import { SettingsService } from '../../generated';
import { Injectable } from '@angular/core';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AugmentedSettingsService extends SettingsService {
  constructor(httpRequest: BaseHttpRequest, private _http: HttpClient) {
    super(httpRequest);
  }

  override getSetting<T>(id: string): Observable<T> {
    return this._http.get<T>(`/rest/settings/${id}`);
  }

  /*
    Enforcing application/json headers
   */
  override saveSetting<T>(id: string, requestBody?: any): Observable<any> {
    if (typeof requestBody === 'string') {
      // surrounding strings with quotes, so they can be sent as json
      requestBody = `"${requestBody}"`;
    }
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    return this._http.post<T>(`/rest/settings/${id}`, requestBody, { headers });
  }
}
