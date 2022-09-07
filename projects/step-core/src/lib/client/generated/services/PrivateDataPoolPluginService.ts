/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { DataPoolConfiguration } from '../models/DataPoolConfiguration';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class PrivateDataPoolPluginService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param id
   * @returns DataPoolConfiguration default response
   * @throws ApiError
   */
  public getDataPoolDefaultInstance(id: string): Observable<DataPoolConfiguration> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/datapool/types/{id}',
      path: {
        id: id,
      },
    });
  }
}
