/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { ExecutionParameters } from '../models/ExecutionParameters';
import type { FunctionTestingSession } from '../models/FunctionTestingSession';
import type { ReportNode } from '../models/ReportNode';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({providedIn:'root'})
export class InteractivePlanExecutionService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param id
     * @param planid
     * @param artefactid
     * @returns ReportNode default response
     * @throws ApiError
     */
    public executeArtefact(
        id: string,
        planid: string,
        artefactid: string,
    ): Observable<ReportNode> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/interactive/{id}/execute/{planid}/{artefactid}',
            path: {
                'id': id,
                'planid': planid,
                'artefactid': artefactid,
            },
        });
    }

    /**
     * @param requestBody
     * @returns string default response
     * @throws ApiError
     */
    public start(
        requestBody?: ExecutionParameters,
    ): Observable<string> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/interactive/start',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param keywordid
     * @returns FunctionTestingSession default response
     * @throws ApiError
     */
    public startFunctionTestingSession(
        keywordid: string,
    ): Observable<FunctionTestingSession> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/interactive/functiontest/{keywordid}/start',
            path: {
                'keywordid': keywordid,
            },
        });
    }

    /**
     * @param id
     * @returns any default response
     * @throws ApiError
     */
    public stop(
        id: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/interactive/{id}/stop',
            path: {
                'id': id,
            },
        });
    }

}
