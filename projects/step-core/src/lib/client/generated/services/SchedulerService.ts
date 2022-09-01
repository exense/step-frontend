/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AsyncTaskStatusVoid } from '../models/AsyncTaskStatusVoid';
import type { BulkOperationParameters } from '../models/BulkOperationParameters';
import type { ExecutiontTaskParameters } from '../models/ExecutiontTaskParameters';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class SchedulerService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Deletes the entities according to the provided parameters
   * @param requestBody
   * @returns AsyncTaskStatusVoid default response
   * @throws ApiError
   */
  public deleteExecutionTasks(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatusVoid> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/scheduler/task/bulk/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Clones the entity with the given Id
   * @param id
   * @returns ExecutiontTaskParameters default response
   * @throws ApiError
   */
  public cloneExecutionTask(id: string): Observable<ExecutiontTaskParameters> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/scheduler/task/{id}/clone',
      path: {
        id: id,
      },
    });
  }

  /**
   * Clones the entities according to the provided parameters
   * @param requestBody
   * @returns AsyncTaskStatusVoid default response
   * @throws ApiError
   */
  public cloneExecutionTasks(requestBody?: BulkOperationParameters): Observable<AsyncTaskStatusVoid> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/scheduler/task/bulk/clone',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

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
   * Retrieves an entity by its Id
   * @param id
   * @returns ExecutiontTaskParameters default response
   * @throws ApiError
   */
  public getExecutionTaskById(id: string): Observable<ExecutiontTaskParameters> {
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
   * @param enabled
   * @returns any default response
   * @throws ApiError
   */
  public enableExecutionTask(id: string, enabled?: boolean): Observable<any> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/scheduler/task/{id}',
      path: {
        id: id,
      },
      query: {
        enabled: enabled,
      },
    });
  }

  /**
   * Deletes the entity with the given Id
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public deleteExecutionTask(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/scheduler/task/{id}',
      path: {
        id: id,
      },
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
   * Returns the list of entities matching the provided attributes
   * @param requestBody
   * @returns ExecutiontTaskParameters default response
   * @throws ApiError
   */
  public findExecutionTasksByAttributes(
    requestBody?: Record<string, string>
  ): Observable<Array<ExecutiontTaskParameters>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/scheduler/task/find',
      body: requestBody,
      mediaType: 'application/json',
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
   * Saves the provided entity
   * @param requestBody
   * @returns ExecutiontTaskParameters default response
   * @throws ApiError
   */
  public saveExecutionTask(requestBody?: ExecutiontTaskParameters): Observable<ExecutiontTaskParameters> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/scheduler/task',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
