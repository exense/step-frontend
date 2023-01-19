import { SettingsService } from '../../generated';
import { Injectable } from '@angular/core';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { HttpClient } from '@angular/common/http';
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
}
