/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { DataTableResponse } from '../models/DataTableResponse';
import type { ExportStatus } from '../models/ExportStatus';
import type { WebPlugin } from '../models/WebPlugin';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class TablesService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param id
     * @returns string default response
     * @throws ApiError
     */
    public createExport(
        id: string,
    ): Observable<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/table/{id}/export',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns ExportStatus default response
     * @throws ApiError
     */
    public getExport(
        id: string,
    ): Observable<ExportStatus> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/table/exports/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @param column
     * @returns string default response
     * @throws ApiError
     */
    public getTableColumnDistinct(
        id: string,
        column: string,
    ): Observable<Array<string>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/table/{id}/column/{column}/distinct',
            path: {
                'id': id,
                'column': column,
            },
        });
    }

    /**
     * @param id
     * @returns DataTableResponse default response
     * @throws ApiError
     */
    public getTableDataGet(
        id: string,
    ): Observable<DataTableResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/table/{id}/data',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns DataTableResponse default response
     * @throws ApiError
     */
    public getTableDataPost(
        id: string,
    ): Observable<DataTableResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/table/{id}/data',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns WebPlugin default response
     * @throws ApiError
     */
    public getWebPlugins(): Observable<Array<WebPlugin>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/table/plugins',
        });
    }

    /**
     * @param id
     * @param column
     * @param requestBody
     * @returns string default response
     * @throws ApiError
     */
    public searchIdsBy(
        id: string,
        column: string,
        requestBody?: string,
    ): Observable<Array<string>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/table/{id}/searchIdsBy/{column}',
            path: {
                'id': id,
                'column': column,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
