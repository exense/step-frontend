import { ExecutionParameters, InteractivePlanExecutionService } from '../../generated';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AugmentedInteractivePlanExecutionService extends InteractivePlanExecutionService {
  private _httpClient = inject(HttpClient);

  override startInteractiveSession(requestBody?: ExecutionParameters): Observable<string> {
    return this._httpClient.post('rest/interactive/start', requestBody, { responseType: 'text' });
  }
}
