/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusObject } from '../models/AsyncTaskStatusObject';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class AsyncTasksService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Retrieve the status of an async task by its Id. Completed tasks will be removed when calling this service.
   * @param id
   * @returns AsyncTaskStatusObject default response
   * @throws ApiError
   */
  public getAsyncTaskStatus(id: string): Observable<AsyncTaskStatusObject> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/async/{id}',
      path: {
        id: id,
      },
    });
  }
}
