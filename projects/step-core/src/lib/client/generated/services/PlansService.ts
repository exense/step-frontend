/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AbstractArtefact } from '../models/AbstractArtefact';
import type { BulkOperationParameters } from '../models/BulkOperationParameters';
import type { ExportStatus } from '../models/ExportStatus';
import type { Plan } from '../models/Plan';
import type { PlanCompilationResult } from '../models/PlanCompilationResult';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class PlansService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

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
   * Clones and returns the plan with the given id. The result of this method will have to be saved with the dedicated method.
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
   * Bulk clone plans according to the provided parameters
   * @param requestBody
   * @returns ExportStatus default response
   * @throws ApiError
   */
  public clonePlans(requestBody?: BulkOperationParameters): Observable<ExportStatus> {
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
   * Returns the plan with the given id.
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
   * Deletes the plan with the given id.
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
   * Bulk delete plans according to the provided parameters
   * @param requestBody
   * @returns ExportStatus default response
   * @throws ApiError
   */
  public deletePlans(requestBody?: BulkOperationParameters): Observable<ExportStatus> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/plans/bulk/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Returns the plans matching the given attributes.
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
   * Creates / updates the given plan.
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
}
