/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Parameter } from '../models/Parameter';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({providedIn:'root'})
export class ParametersService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param id
     * @returns Parameter default response
     * @throws ApiError
     */
    public copyParameter(
        id: string,
    ): Observable<Parameter> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/parameters/{id}/copy',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns Parameter default response
     * @throws ApiError
     */
    public getParameterById(
        id: string,
    ): Observable<Parameter> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/parameters/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns any default response
     * @throws ApiError
     */
    public deleteParameter(
        id: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/parameters/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param requestBody
     * @returns Parameter default response
     * @throws ApiError
     */
    public findParametersByAttributes(
        requestBody?: Record<string, string>,
    ): Observable<Array<Parameter>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/parameters/find',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param skip
     * @param limit
     * @returns Parameter default response
     * @throws ApiError
     */
    public getAllParameters(
        skip?: number,
        limit?: number,
    ): Observable<Array<Parameter>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/parameters/all',
            query: {
                'skip': skip,
                'limit': limit,
            },
        });
    }

    /**
     * @param requestBody
     * @returns Parameter default response
     * @throws ApiError
     */
    public getParameterByAttributes(
        requestBody?: Record<string, string>,
    ): Observable<Parameter> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/parameters/search',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns Parameter default response
     * @throws ApiError
     */
    public newParameter(): Observable<Parameter> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/parameters',
        });
    }

    /**
     * @param requestBody
     * @returns Parameter default response
     * @throws ApiError
     */
    public saveParameter(
        requestBody?: Parameter,
    ): Observable<Parameter> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/parameters',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
