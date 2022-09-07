/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { RTMLink } from '../models/RTMLink';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class RtmService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param id
   * @returns RTMLink default response
   * @throws ApiError
   */
  public getRtmLink(id: string): Observable<RTMLink> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/rtm/rtmlink/{id}',
      path: {
        id: id,
      },
    });
  }
}
