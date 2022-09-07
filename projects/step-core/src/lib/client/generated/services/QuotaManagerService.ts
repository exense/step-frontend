/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class QuotaManagerService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @returns string default response
   * @throws ApiError
   */
  public getQuotaManagerStatus(): Observable<string> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/quotamanager/status',
    });
  }
}
