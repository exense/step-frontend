/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AggregatedReportView } from '../models/AggregatedReportView';
import type { AggregatedReportViewRequest } from '../models/AggregatedReportViewRequest';
import type { AsyncTaskStatusTableBulkOperationReport } from '../models/AsyncTaskStatusTableBulkOperationReport';
import type { Execution } from '../models/Execution';
import type { ExecutionParameters } from '../models/ExecutionParameters';
import type { FindByCriteraParam } from '../models/FindByCriteraParam';
import type { ReportNode } from '../models/ReportNode';
import type { RepositoryObjectReference } from '../models/RepositoryObjectReference';
import type { TableBulkOperationRequest } from '../models/TableBulkOperationRequest';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class ExecutionsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Stops the execution with the given execution id.
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public abort(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/executions/{id}/stop',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns the execution with the given execution id.
   * @param id
   * @returns Execution default response
   * @throws ApiError
   */
  public getExecutionById(id: string): Observable<Execution> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/executions/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Delete the execution with the given execution id, use the housekeeping services for full deletion
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public deleteExecution(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/executions/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Starts an execution with the given parameters.
   * @param requestBody
   * @returns string default response
   * @throws ApiError
   */
  public execute(requestBody?: ExecutionParameters): Observable<string> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/executions/start',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns the execution matching the given criteria.
   * @param requestBody
   * @returns Execution default response
   * @throws ApiError
   */
  public findByCritera(requestBody?: FindByCriteraParam): Observable<Array<Execution>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/executions/search/by/critera',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Force stop the execution with the given execution id.
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public forceStop(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/executions/{id}/force-stop',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns the full aggregated report view for the provided execution.
   * @param id
   * @returns AggregatedReportView default response
   * @throws ApiError
   */
  public getFullAggregatedReportView(id: string): Observable<AggregatedReportView> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/executions/{id}/report/aggregated',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns an aggregated report view for the provided execution and aggregation parameters.
   * @param id
   * @param requestBody
   * @returns AggregatedReportView default response
   * @throws ApiError
   */
  public getAggregatedReportView(
    id: string,
    requestBody?: AggregatedReportViewRequest,
  ): Observable<AggregatedReportView> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/executions/{id}/report/aggregated',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns all executions.
   * @param skip
   * @param limit
   * @returns Execution default response
   * @throws ApiError
   */
  public getAll(skip?: number, limit?: number): Observable<Array<Execution>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/executions',
      query: {
        skip: skip,
        limit: limit,
      },
    });
  }

  /**
   * Updates the provided execution.
   * @param requestBody
   * @returns Execution default response
   * @throws ApiError
   */
  public saveExecution(requestBody?: Execution): Observable<Execution> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/executions',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns the executions matching the provided attributes.
   * @param requestBody
   * @returns Execution default response
   * @throws ApiError
   */
  public getExecutionByAttribute(requestBody?: Record<string, string>): Observable<Execution> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/executions/search',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns a list of executions by the provided ids.
   * @param requestBody
   * @returns Execution default response
   * @throws ApiError
   */
  public getExecutionsByIds(requestBody?: Array<string>): Observable<Array<Execution>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/executions/search/by/ids',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns the execution matching the provided repository object reference.
   * @param requestBody
   * @returns Execution default response
   * @throws ApiError
   */
  public getExecutionsByRepositoryObjectReference(
    requestBody?: RepositoryObjectReference,
  ): Observable<Array<Execution>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/executions/search/by/ref',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns a map of execution ID to names by the provided ids.
   * @param requestBody
   * @returns string default response
   * @throws ApiError
   */
  public getExecutionsNamesByIds(requestBody?: Array<string>): Observable<Record<string, string>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/executions/search/names/by/ids',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns the list of report nodes with contributing errors for the given execution
   * @param id
   * @param skip
   * @param limit
   * @returns ReportNode default response
   * @throws ApiError
   */
  public getReportNodeWithContributingErrors(id: string, skip?: number, limit?: number): Observable<Array<ReportNode>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/executions/{id}/reportnodes-with-errors',
      path: {
        id: id,
      },
      query: {
        skip: skip,
        limit: limit,
      },
    });
  }

  /**
   * Returns the list of report nodes by execution id and artefact hash
   * @param id
   * @param hash
   * @param skip
   * @param limit
   * @returns ReportNode default response
   * @throws ApiError
   */
  public getReportNodesByArtefactHash(
    id: string,
    hash: string,
    skip?: number,
    limit?: number,
  ): Observable<Array<ReportNode>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/executions/{id}/reportnodes-by-hash/{hash}',
      path: {
        id: id,
        hash: hash,
      },
      query: {
        skip: skip,
        limit: limit,
      },
    });
  }

  /**
   * Returns the report nodes of the given execution and matching the given class.
   * @param id
   * @param _class
   * @param limit
   * @returns ReportNode default response
   * @throws ApiError
   */
  public getReportNodesByExecutionId(id: string, _class?: string, limit?: number): Observable<Array<ReportNode>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/executions/{id}/reportnodes',
      path: {
        id: id,
      },
      query: {
        class: _class,
        limit: limit,
      },
    });
  }

  /**
   * Restart multiple executions according to the provided parameters.
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public restartExecutions(
    requestBody?: TableBulkOperationRequest,
  ): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/executions/bulk/restart',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Stop multiple executions according to the provided parameters.
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public stopExecutions(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/executions/bulk/stop',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
