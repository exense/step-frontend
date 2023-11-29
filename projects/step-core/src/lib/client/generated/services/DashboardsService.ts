/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { DashboardView } from '../models/DashboardView';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class DashboardsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @returns DashboardView default response
   * @throws ApiError
   */
  public getAll1(): Observable<Array<DashboardView>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/dashboards',
    });
  }
}
