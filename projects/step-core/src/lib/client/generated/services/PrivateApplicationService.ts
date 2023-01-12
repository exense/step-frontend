/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AbstractWebPlugin } from '../models/AbstractWebPlugin';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class PrivateApplicationService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @returns AbstractWebPlugin default response
   * @throws ApiError
   */
  public getWebPlugins(): Observable<Array<AbstractWebPlugin>> {
    return this.httpRequest.request({
      method: 'GET',
      url: 'app/plugins',
    });
  }
}
