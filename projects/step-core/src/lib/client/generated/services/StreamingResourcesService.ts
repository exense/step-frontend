/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class StreamingResourcesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @returns any default response
   * @throws ApiError
   */
  public demo(): Observable<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/streaming-resources/demo',
    });
  }

  /**
   * @param id
   * @param start
   * @param end
   * @param inline
   * @returns any default response
   * @throws ApiError
   */
  public download(id: string, start?: number, end?: number, inline?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/streaming-resources/{id}/download',
      path: {
        id: id,
      },
      query: {
        start: start,
        end: end,
        inline: inline,
      },
    });
  }
}
