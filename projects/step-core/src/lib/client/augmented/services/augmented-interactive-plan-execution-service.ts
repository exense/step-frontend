import { ExecutionParameters, InteractivePlanExecutionService } from '../../generated';
import { Observable } from 'rxjs';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AugmentedInteractivePlanExecutionService extends InteractivePlanExecutionService {
  constructor(httpRequest: BaseHttpRequest, private _httpClient: HttpClient) {
    super(httpRequest);
  }

  override startInteractiveSession(requestBody?: ExecutionParameters): Observable<string> {
    return this._httpClient.post('/rest/interactive/start', requestBody, { responseType: 'text' });
  }
}
