/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { ExecutiontTaskParameters } from '../models/ExecutiontTaskParameters';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class SchedulerService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Returns a new scheduler task instance as template. This instance will have to be saved using the dedicated service.
   * @returns ExecutiontTaskParameters default response
   * @throws ApiError
   */
  public createExecutionTask(): Observable<ExecutiontTaskParameters> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/scheduler/task/new',
    });
  }

  /**
   * Enable/disable all the scheduler tasks.
   * @param enabled
   * @returns any default response
   * @throws ApiError
   */
  public enableAllExecutionTasksSchedule(enabled?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/scheduler/task/schedule',
      query: {
        enabled: enabled,
      },
    });
  }

  /**
   * Returns the scheduler task for the given ID.
   * @param id
   * @returns ExecutiontTaskParameters default response
   * @throws ApiError
   */
  public getExecutionTask(id: string): Observable<ExecutiontTaskParameters> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/scheduler/task/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Enable/disable the given scheduler task.
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public enableExecutionTask(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/scheduler/task/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Remove or disable the given scheduler task, depending on the 'remove' parameter.
   * @param id
   * @param remove
   * @returns any default response
   * @throws ApiError
   */
  public removeExecutionTask(id: string, remove?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/scheduler/task/{id}',
      path: {
        id: id,
      },
      query: {
        remove: remove,
      },
    });
  }

  /**
   * Execute the given scheduler task.
   * @param id
   * @returns string default response
   * @throws ApiError
   */
  public executeTask(id: string): Observable<string> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/scheduler/task/{id}/execute',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns all the scheduled tasks.
   * @returns ExecutiontTaskParameters default response
   * @throws ApiError
   */
  public getScheduledExecutions(): Observable<Array<ExecutiontTaskParameters>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/scheduler/task',
    });
  }

  /**
   * Create or update a scheduler task.
   * @param requestBody
   * @returns any default response
   * @throws ApiError
   */
  public schedule(requestBody?: ExecutiontTaskParameters): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/scheduler/task',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
