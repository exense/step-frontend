/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AbstractArtefact } from '../models/AbstractArtefact';
import type { AsyncTaskStatusTableBulkOperationReport } from '../models/AsyncTaskStatusTableBulkOperationReport';
import type { History } from '../models/History';
import type { Plan } from '../models/Plan';
import type { PlanCompilationResult } from '../models/PlanCompilationResult';
import type { TableBulkOperationRequest } from '../models/TableBulkOperationRequest';
import type { TableRequest } from '../models/TableRequest';
import type { TableResponsePlan } from '../models/TableResponsePlan';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class PlansService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * Deletes the entities according to the provided parameters
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public deletePlans(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/plans/bulk/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Clones the entity with the given Id
   * @param id
   * @returns Plan default response
   * @throws ApiError
   */
  public clonePlan(id: string): Observable<Plan> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/plans/{id}/clone',
      path: {
        id: id,
      },
    });
  }

  /**
   * Clones the provided artefact.
   * @param requestBody
   * @returns AbstractArtefact default response
   * @throws ApiError
   */
  public cloneArtefact(requestBody?: AbstractArtefact): Observable<AbstractArtefact> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/plans/artefacts/clone',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Clones the provided artefacts.
   * @param requestBody
   * @returns AbstractArtefact default response
   * @throws ApiError
   */
  public cloneArtefacts(requestBody?: Array<AbstractArtefact>): Observable<Array<AbstractArtefact>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/plans/artefacts/clonemany',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Clones the entities according to the provided parameters
   * @param requestBody
   * @returns AsyncTaskStatusTableBulkOperationReport default response
   * @throws ApiError
   */
  public clonePlans(requestBody?: TableBulkOperationRequest): Observable<AsyncTaskStatusTableBulkOperationReport> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/plans/bulk/clone',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Compiles the provided plan.
   * @param requestBody
   * @returns PlanCompilationResult default response
   * @throws ApiError
   */
  public compilePlan(requestBody?: Plan): Observable<PlanCompilationResult> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/plans/compile',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Compiles the plan with the given id.
   * @param id
   * @returns PlanCompilationResult default response
   * @throws ApiError
   */
  public compilePlanWithId(id: string): Observable<PlanCompilationResult> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/plans/{id}/compile',
      path: {
        id: id,
      },
    });
  }

  /**
   * Retrieves an entity by its Id
   * @param id
   * @returns Plan default response
   * @throws ApiError
   */
  public getPlanById(id: string): Observable<Plan> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/plans/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Deletes the entity with the given Id
   * @param id
   * @returns any default response
   * @throws ApiError
   */
  public deletePlan(id: string): Observable<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/plans/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns the list of entities matching the provided attributes
   * @param requestBody
   * @returns Plan default response
   * @throws ApiError
   */
  public findPlansByAttributes(requestBody?: Record<string, string>): Observable<Array<Plan>> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/plans/find',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns all the plans.
   * @param skip
   * @param limit
   * @returns Plan default response
   * @throws ApiError
   */
  public getAllPlans(skip?: number, limit?: number): Observable<Array<Plan>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/plans/all',
      query: {
        skip: skip,
        limit: limit,
      },
    });
  }

  /**
   * Returns the names of the supported artefacts.
   * @returns string default response
   * @throws ApiError
   */
  public getArtefactTemplates(): Observable<Array<string>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/plans/artefact/templates',
    });
  }

  /**
   * Returns the artefact with the given id.
   * @param id
   * @returns AbstractArtefact default response
   * @throws ApiError
   */
  public getArtefactType(id: string): Observable<AbstractArtefact> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/plans/artefact/types/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns the supported artefact types.
   * @returns string default response
   * @throws ApiError
   */
  public getArtefactTypes(): Observable<Array<string>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/plans/artefact/types',
    });
  }

  /**
   * Retrieves entity's versioned
   * @param id
   * @returns History default response
   * @throws ApiError
   */
  public getPlanHistory(id: string): Observable<Array<History>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/plans/{id}/history',
      path: {
        id: id,
      },
    });
  }

  /**
   * Returns the first plan matching the given attributes.
   * @param requestBody
   * @returns Plan default response
   * @throws ApiError
   */
  public getPlanByAttributes(requestBody?: Record<string, string>): Observable<Plan> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/plans/search',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns the plan referenced by the given artifact within the given plan.
   * @param id
   * @param artefactid
   * @returns Plan default response
   * @throws ApiError
   */
  public lookupPlan(id: string, artefactid: string): Observable<Plan> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/plans/{id}/artefacts/{artefactid}/lookup/plan',
      path: {
        id: id,
        artefactid: artefactid,
      },
    });
  }

  /**
   * Returns a new plan instance as template.
   * @param type
   * @param template
   * @returns Plan default response
   * @throws ApiError
   */
  public newPlan(type?: string, template?: string): Observable<Plan> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/plans',
      query: {
        type: type,
        template: template,
      },
    });
  }

  /**
   * Saves the provided entity
   * @param requestBody
   * @returns Plan default response
   * @throws ApiError
   */
  public savePlan(requestBody?: Plan): Observable<Plan> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/plans',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Get the table view according to provided request
   * @param requestBody
   * @returns TableResponsePlan default response
   * @throws ApiError
   */
  public getPlanTable(requestBody?: TableRequest): Observable<TableResponsePlan> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/plans/table',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Restore a version of this entity
   * @param id
   * @param versionId
   * @returns Plan default response
   * @throws ApiError
   */
  public restorePlanVersion(id: string, versionId: string): Observable<Plan> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/plans/{id}/restore/{versionId}',
      path: {
        id: id,
        versionId: versionId,
      },
    });
  }
}
