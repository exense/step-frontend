/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { FormDataContentDisposition } from '../models/FormDataContentDisposition';
import type { Plan } from '../models/Plan';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({providedIn:'root'})
export class PrivateStagingRepositoryService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns string default response
     * @throws ApiError
     */
    public createContext(): Observable<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/staging/context',
        });
    }

    /**
     * @param id
     * @returns any default response
     * @throws ApiError
     */
    public destroyStagingContext(
        id: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/staging/context/{id}/destroy',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @param isolate
     * @param requestBody
     * @returns string default response
     * @throws ApiError
     */
    public executeInStagingContext(
        id: string,
        isolate?: boolean,
        requestBody?: Record<string, string>,
    ): Observable<string> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/staging/context/{id}/execute',
            path: {
                'id': id,
            },
            query: {
                'isolate': isolate,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param formData
     * @returns string default response
     * @throws ApiError
     */
    public uploadFile(
        id: string,
        formData?: {
            file?: FormDataContentDisposition;
        },
    ): Observable<string> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/staging/context/{id}/file',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public uploadPlan(
        id: string,
        requestBody?: Plan,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/staging/context/{id}/plan',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
