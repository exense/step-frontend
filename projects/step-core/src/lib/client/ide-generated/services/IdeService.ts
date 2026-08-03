/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AiConfiguration } from '../models/AiConfiguration';
import type { AiGenerateRequest } from '../models/AiGenerateRequest';
import type { AiGenerateResponse } from '../models/AiGenerateResponse';
import type { AiSpec } from '../models/AiSpec';
import type { AutomationPackageDescriptor } from '../models/AutomationPackageDescriptor';

import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';

@Injectable({ providedIn: 'root' })
export class IdeService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  /**
   * @returns any default response
   * @throws ApiError
   */
  public closeAp(): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/ide/ap/close',
    });
  }

  /**
   * @returns AutomationPackageDescriptor default response
   * @throws ApiError
   */
  public getCurrentAp(): Observable<AutomationPackageDescriptor> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/local/ide/ap/current',
    });
  }

  /**
   * @param existingEmptyDirectory
   * @param apName
   * @returns any default response
   * @throws ApiError
   */
  public initializeNewAp(existingEmptyDirectory?: string, apName?: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/ide/ap/initialize-new',
      query: {
        existingEmptyDirectory: existingEmptyDirectory,
        apName: apName,
      },
    });
  }

  /**
   * @param directory
   * @returns any default response
   * @throws ApiError
   */
  public useExistingAp(directory?: string): Observable<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/ide/ap/use-existing',
      query: {
        directory: directory,
      },
    });
  }

  /**
   * @returns AiConfiguration default response
   * @throws ApiError
   */
  public getAiConfiguration(): Observable<AiConfiguration> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/local/ide/ai/config',
    });
  }

  /**
   * @param testCaseName
   * @returns AiSpec default response
   * @throws ApiError
   */
  public getAiSpec(testCaseName?: string): Observable<AiSpec> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/local/ide/ai/spec',
      query: {
        testCaseName: testCaseName,
      },
    });
  }

  /**
   * Writes the specs and launches the agentic workflow.
   * @param requestBody
   * @returns string the id of the launched execution
   * @throws ApiError
   */
  public generateAiPlans(requestBody?: AiGenerateRequest): Observable<AiGenerateResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/local/ide/ai/generate',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
