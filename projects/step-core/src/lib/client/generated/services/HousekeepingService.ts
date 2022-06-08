/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class HousekeepingService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param id
     * @returns any default response
     * @throws ApiError
     */
    public deleteExection(
        id: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/housekeeping/execution/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public setExecutionDescription(
        id: string,
        requestBody?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/housekeeping/execution/{id}/description',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public setExecutionProtection(
        id: string,
        requestBody?: boolean,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/housekeeping/execution/{id}/protection',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
