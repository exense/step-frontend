/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Message } from '../models/Message';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @param state
   * @returns number default response
   * @throws ApiError
   */
  public count(state?: Array<'DISMISSED' | 'READ' | 'UNREAD'>): Observable<number> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/messages/count',
      query: {
        state: state,
      },
    });
  }

  /**
   * @returns Message default response
   * @throws ApiError
   */
  public listAll(): Observable<Array<Message>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/messages/allDontUse',
    });
  }

  /**
   * @param id
   * @param state
   * @returns any default response
   * @throws ApiError
   */
  public setState(id: string, state?: 'DISMISSED' | 'READ' | 'UNREAD'): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/messages/{id}',
      path: {
        id: id,
      },
      query: {
        state: state,
      },
    });
  }
}
