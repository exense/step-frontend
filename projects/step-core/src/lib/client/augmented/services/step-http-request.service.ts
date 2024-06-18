import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularHttpRequest } from '../../generated/core/AngularHttpRequest';
import { ApiRequestOptions } from '../../generated/core/ApiRequestOptions';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { stepRequest } from '../shared/step-request';

@Injectable({
  providedIn: 'root',
})
export class StepHttpRequestService extends AngularHttpRequest {
  private _contextHolder = inject(HttpRequestContextHolderService);

  override request<T>(options: ApiRequestOptions): Observable<T> {
    return stepRequest(this.config, this.http, this._contextHolder.decorateRequestOptions(options));
  }
}
