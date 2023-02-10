import { SettingsService } from '../../generated';
import { Injectable } from '@angular/core';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiRequestOptions } from '../../generated/core/ApiRequestOptions';

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
    Fixed issue where requestBody = false caused no payload to be send
   */
  override saveSetting(id: string, requestBody?: any): Observable<any> {
    if (id === 'housekeeping_enabled') {
      return this._http.post<boolean>(`/rest/settings/${id}`, requestBody);
    } else {
      return this._http.post<number>(`/rest/settings/${id}`, requestBody);
    }
  }
}
