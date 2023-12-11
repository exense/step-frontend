import { inject, Injectable } from '@angular/core';
import { QuotaManagerService } from '../../generated';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AugmentedQuotaManagerService extends QuotaManagerService {
  private _httpClient = inject(HttpClient);

  override getQuotaManagerStatus(): Observable<string> {
    return this._httpClient.get('/rest/quotamanager/status', { responseType: 'text' });
  }
}
