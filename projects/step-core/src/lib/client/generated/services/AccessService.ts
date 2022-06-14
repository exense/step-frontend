/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AccessConfiguration } from '../models/AccessConfiguration';
import type { Credentials } from '../models/Credentials';
import type { SessionResponse } from '../models/SessionResponse';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({providedIn:'root'})
export class AccessService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public authenticateUser(
        requestBody?: Credentials,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/access/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns AccessConfiguration default response
     * @throws ApiError
     */
    public getAccessConfiguration(): Observable<AccessConfiguration> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/access/conf',
        });
    }

    /**
     * @returns SessionResponse default response
     * @throws ApiError
     */
    public getCurrentSession(): Observable<SessionResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/access/session',
        });
    }

    /**
     * @param lifetime
     * @returns string default response
     * @throws ApiError
     */
    public getServiceAccountToken(
        lifetime?: number,
    ): Observable<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/access/service-account/token',
            query: {
                'lifetime': lifetime,
            },
        });
    }

    /**
     * @returns any default response
     * @throws ApiError
     */
    public logout(): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/access/logout',
        });
    }

}
