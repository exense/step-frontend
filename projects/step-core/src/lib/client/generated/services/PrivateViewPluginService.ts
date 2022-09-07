/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { ViewModel } from '../models/ViewModel';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class PrivateViewPluginService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param id
   * @param executionId
   * @returns ViewModel default response
   * @throws ApiError
   */
  public getView(id: string, executionId: string): Observable<ViewModel> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/views/{id}/{executionId}',
      path: {
        id: id,
        executionId: executionId,
      },
    });
  }
}
