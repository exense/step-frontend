/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Event } from '../models/Event';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class EventBrokerService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns any default response
     * @throws ApiError
     */
    public clear(): Observable<Record<string, any>> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/eventbroker/events',
        });
    }

    /**
     * @param group
     * @returns Event default response
     * @throws ApiError
     */
    public getFullGroup(
        group: string,
    ): Observable<Array<Event>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/events/group/{group}',
            path: {
                'group': group,
            },
        });
    }

    /**
     * @param group
     * @returns any default response
     * @throws ApiError
     */
    public clearGroup(
        group: string,
    ): Observable<Record<string, any>> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/eventbroker/events/group/{group}',
            path: {
                'group': group,
            },
        });
    }

    /**
     * @returns any default response
     * @throws ApiError
     */
    public clearStats(): Observable<Record<string, any>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/events/monitoring/clear',
        });
    }

    /**
     * @param id
     * @returns Event default response
     * @throws ApiError
     */
    public peekEvent(
        id: string,
    ): Observable<Event> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/event/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns Event default response
     * @throws ApiError
     */
    public consumeEvent(
        id: string,
    ): Observable<Event> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/eventbroker/event/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param group
     * @param name
     * @returns Event default response
     * @throws ApiError
     */
    public peekEventByGroupAndName(
        group: string,
        name: string,
    ): Observable<Event> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/event/group/{group}/name/{name}',
            path: {
                'group': group,
                'name': name,
            },
        });
    }

    /**
     * @param group
     * @param name
     * @returns Event default response
     * @throws ApiError
     */
    public consumeEventByGroupAndName(
        group: string,
        name: string,
    ): Observable<Event> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/eventbroker/event/group/{group}/name/{name}',
            path: {
                'group': group,
                'name': name,
            },
        });
    }

    /**
     * @returns Event default response
     * @throws ApiError
     */
    public getEventBrokerGroupMap(): Observable<Record<string, Array<Event>>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/events/asGroupMap',
        });
    }

    /**
     * @param skip
     * @param limit
     * @returns Event default response
     * @throws ApiError
     */
    public getEventBrokerGroupMap1(
        skip: number,
        limit: number,
    ): Observable<Record<string, Array<Event>>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/events/asGroupMap/skip/{skip}/limit/{limit}',
            path: {
                'skip': skip,
                'limit': limit,
            },
        });
    }

    /**
     * @returns Event default response
     * @throws ApiError
     */
    public getEventBrokerIdMap(): Observable<Record<string, Event>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/events/asIdMap',
        });
    }

    /**
     * @param skip
     * @param limit
     * @returns Event default response
     * @throws ApiError
     */
    public getEventBrokerIdMap1(
        skip: number,
        limit: number,
    ): Observable<Record<string, Event>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/events/asIdMap/skip/{skip}/limit/{limit}',
            path: {
                'skip': skip,
                'limit': limit,
            },
        });
    }

    /**
     * @param group
     * @returns number default response
     * @throws ApiError
     */
    public getGroupSize(
        group: string,
    ): Observable<number> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/events/group/{group}/size',
            path: {
                'group': group,
            },
        });
    }

    /**
     * @param group
     * @param skip
     * @param limit
     * @returns Event default response
     * @throws ApiError
     */
    public getGroupSkipLimit(
        group: string,
        skip: number,
        limit: number,
    ): Observable<Array<Event>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/events/group/{group}/skip/{skip}/limit/{limit}',
            path: {
                'group': group,
                'skip': skip,
                'limit': limit,
            },
        });
    }

    /**
     * @param group
     * @returns any default response
     * @throws ApiError
     */
    public getGroupStats(
        group: string,
    ): Observable<Record<string, any>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/events/monitoring/group/{group}',
            path: {
                'group': group,
            },
        });
    }

    /**
     * @returns string default response
     * @throws ApiError
     */
    public getGroups(): Observable<Array<string>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/events/groups',
        });
    }

    /**
     * @returns any default response
     * @throws ApiError
     */
    public getStats(): Observable<Record<string, any>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/events/monitoring/global',
        });
    }

    /**
     * @param requestBody
     * @returns Event default response
     * @throws ApiError
     */
    public putEvent(
        requestBody?: Event,
    ): Observable<Event> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/eventbroker/event',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param circuitBreakerThreshold
     * @returns any default response
     * @throws ApiError
     */
    public setCircuitBreakerThreshold(
        circuitBreakerThreshold: number,
    ): Observable<Record<string, any>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/eventbroker/events/config/circuitBreakerThreshold/{circuitBreakerThreshold}',
            path: {
                'circuitBreakerThreshold': circuitBreakerThreshold,
            },
        });
    }

}
