/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { DashboardEntry } from '../models/DashboardEntry';
import type { ExportStatus } from '../models/ExportStatus';
import type { SchedulerTasksAndConfiguration } from '../models/SchedulerTasksAndConfiguration';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class MonitoringDashboardService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns ExportStatus default response
     * @throws ApiError
     */
    public export(): Observable<ExportStatus> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/monitoringdashboard/export',
        });
    }

    /**
     * @returns DashboardEntry default response
     * @throws ApiError
     */
    public getMonitoringDashboard(): Observable<Array<DashboardEntry>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/monitoringdashboard/get',
        });
    }

    /**
     * @param filter
     * @returns SchedulerTasksAndConfiguration default response
     * @throws ApiError
     */
    public getSchedulerTasksAndConfiguration(
        filter?: boolean,
    ): Observable<Array<SchedulerTasksAndConfiguration>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/monitoringdashboard/configuration/list',
            query: {
                'filter': filter,
            },
        });
    }

    /**
     * @param taskId
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public setDisplay(
        taskId: string,
        requestBody?: boolean,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/monitoringdashboard/configuration/{taskId}/display',
            path: {
                'taskId': taskId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param taskId
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public setPosition(
        taskId: string,
        requestBody?: number,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/monitoringdashboard/configuration/{taskId}/position',
            path: {
                'taskId': taskId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
