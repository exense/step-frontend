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
    public copy(
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
    public get8(
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
    public delete5(
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
    public findMany2(
        requestBody?: Record<string, string>,
    ): Observable<Array<Parameter>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/parameters/find',
            body: requestBody,
            mediaType: '*/*',
        });
    }

    /**
     * @param requestBody
     * @returns Parameter default response
     * @throws ApiError
     */
    public get9(
        requestBody?: Record<string, string>,
    ): Observable<Parameter> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/parameters/search',
            body: requestBody,
            mediaType: '*/*',
        });
    }

    /**
     * @param skip
     * @param limit
     * @returns Parameter default response
     * @throws ApiError
     */
    public getAll4(
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
    public save6(
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
