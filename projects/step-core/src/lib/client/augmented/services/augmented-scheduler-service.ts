/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { SchedulerService } from '../../generated';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class AugmentedSchedulerService extends SchedulerService {
  constructor(override httpRequest: BaseHttpRequest, private _httpClient: HttpClient) {
    super(httpRequest);
  }

  /**
   * Execute the given scheduler task.
   * The API does not return a JSON, therefore the expectation of the generated client code does not meet and it throws an error.
   * Using basic HttpClient to configure the responseType
   * @param id
   * @returns string default response
   * @throws ApiError
   */
  public override executeTask(id: string): Observable<string> {
    //@ts-ignore
    return this._httpClient.post<any>('rest/scheduler/task/' + id + '/execute', null, { responseType: 'text' });
  }

  public isSchedulerEnabled(): Observable<boolean> {
    return this._httpClient.get<boolean>('rest/settings/scheduler_enabled');
  }
}
