/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Plan } from '../models/Plan';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class CompositesService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Clones the plan of the composite to a new plan
   * @param id
   * @returns Plan default response
   * @throws ApiError
   */
  public cloneCompositePlan(id: string): Observable<Plan> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/composites/{id}/clone/plan',
      path: {
        id: id,
      },
    });
  }
}
