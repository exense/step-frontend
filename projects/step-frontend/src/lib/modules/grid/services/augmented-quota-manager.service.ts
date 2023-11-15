import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuotaManagerService } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class AugmentedQuotaManagerService extends QuotaManagerService {
  private _httpClient = inject(HttpClient);

  override getQuotaManagerStatus(): Observable<any> {
    return this._httpClient.get(`rest/quotamanager/status`, { responseType: 'text' });
  }
}
