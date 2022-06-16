/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Function } from '../models/Function';
import type { FunctionPackage } from '../models/FunctionPackage';
import type { PackagePreview } from '../models/PackagePreview';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({providedIn:'root'})
export class KeywordPackagesService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param id
     * @returns FunctionPackage default response
     * @throws ApiError
     */
    public get7(
        id: string,
    ): Observable<FunctionPackage> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/functionpackages/{id}',
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
    public delete4(
        id: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/functionpackages/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns Function default response
     * @throws ApiError
     */
    public getPackageFunctions(
        id: string,
    ): Observable<Array<Function>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/functionpackages/{id}/functions',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param resourceName
     * @returns FunctionPackage default response
     * @throws ApiError
     */
    public lookupByResourceName(
        resourceName: string,
    ): Observable<FunctionPackage> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/functionpackages/resourcebased/lookup/{resourceName}',
            path: {
                'resourceName': resourceName,
            },
        });
    }

    /**
     * @param requestBody
     * @returns PackagePreview default response
     * @throws ApiError
     */
    public packagePreview(
        requestBody?: FunctionPackage,
    ): Observable<PackagePreview> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/functionpackages/preview',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns FunctionPackage default response
     * @throws ApiError
     */
    public reload(
        id: string,
    ): Observable<FunctionPackage> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/functionpackages/{id}/reload',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param requestBody
     * @returns FunctionPackage default response
     * @throws ApiError
     */
    public save5(
        requestBody?: FunctionPackage,
    ): Observable<FunctionPackage> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/functionpackages',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns FunctionPackage default response
     * @throws ApiError
     */
    public update(
        requestBody?: FunctionPackage,
    ): Observable<FunctionPackage> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/functionpackages/resourcebased',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
