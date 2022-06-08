/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { GatewayInfo } from '../models/GatewayInfo';
import type { NotificationGatewayConfiguration } from '../models/NotificationGatewayConfiguration';
import type { NotificationSubscription } from '../models/NotificationSubscription';
import type { RepositoryObjectReference } from '../models/RepositoryObjectReference';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class NotificationsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param id
     * @returns NotificationGatewayConfiguration default response
     * @throws ApiError
     */
    public getNotificationGatewayConfiguration(
        id: string,
    ): Observable<NotificationGatewayConfiguration> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/notifications/gateway/{id}',
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
    public deleteNotificationGatewayConfiguration(
        id: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/notifications/gateway/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns NotificationSubscription default response
     * @throws ApiError
     */
    public getNotificationSubscription(
        id: string,
    ): Observable<NotificationSubscription> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/notifications/subscription/{id}',
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
    public deleteNotificationSubscription(
        id: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/notifications/subscription/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param skip
     * @param limit
     * @returns NotificationSubscription default response
     * @throws ApiError
     */
    public getAll4(
        skip?: number,
        limit?: number,
    ): Observable<Array<NotificationSubscription>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/notifications/subscription/all',
            query: {
                'skip': skip,
                'limit': limit,
            },
        });
    }

    /**
     * @returns NotificationGatewayConfiguration default response
     * @throws ApiError
     */
    public getNotificationGatewayConfigurations(): Observable<Array<NotificationGatewayConfiguration>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/notifications/gateway/list',
        });
    }

    /**
     * @returns GatewayInfo default response
     * @throws ApiError
     */
    public getNotificationGatewayNames(): Observable<Array<GatewayInfo>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/notifications/gateway/list/info',
        });
    }

    /**
     * @param requestBody
     * @returns NotificationSubscription default response
     * @throws ApiError
     */
    public getNotificationSubscriptionsByPlanRef(
        requestBody?: RepositoryObjectReference,
    ): Observable<Array<NotificationSubscription>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/notifications/subscription/byplan',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public saveNotificationGatewayConfiguration(
        requestBody?: NotificationGatewayConfiguration,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/notifications/gateway',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public saveNotificationSubscription(
        requestBody?: NotificationSubscription,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/notifications/subscription',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
