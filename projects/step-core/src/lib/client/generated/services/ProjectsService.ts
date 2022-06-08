/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AssignEntitiesParameters } from '../models/AssignEntitiesParameters';
import type { AssignEntitiesResult } from '../models/AssignEntitiesResult';
import type { Project } from '../models/Project';
import type { ProjectMemberResponse } from '../models/ProjectMemberResponse';
import type { TaskStatus } from '../models/TaskStatus';
import type { Tenant } from '../models/Tenant';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class ProjectsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param id
     * @param userid
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public addMemberToProject(
        id: string,
        userid: string,
        requestBody?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/tenants/project/{id}/members/{userid}',
            path: {
                'id': id,
                'userid': userid,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param userid
     * @returns any default response
     * @throws ApiError
     */
    public removeMemberFromProject(
        id: string,
        userid: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/tenants/project/{id}/members/{userid}',
            path: {
                'id': id,
                'userid': userid,
            },
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns AssignEntitiesResult default response
     * @throws ApiError
     */
    public assignEntities(
        id: string,
        requestBody?: AssignEntitiesParameters,
    ): Observable<AssignEntitiesResult> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/tenants/project/{id}/entities',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param simulate
     * @returns TaskStatus default response
     * @throws ApiError
     */
    public assignUnassignedEntities(
        id: string,
        simulate?: boolean,
    ): Observable<TaskStatus> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/tenants/project/{id}/unassigned-entities',
            path: {
                'id': id,
            },
            query: {
                'simulate': simulate,
            },
        });
    }

    /**
     * @param id
     * @returns Project default response
     * @throws ApiError
     */
    public getProject(
        id: string,
    ): Observable<Project> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tenants/project/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns Project default response
     * @throws ApiError
     */
    public updateProject(
        id: string,
        requestBody?: Project,
    ): Observable<Project> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/tenants/project/{id}',
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
    public deleteProject(
        id: string,
        requestBody?: Project,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/tenants/project/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns Tenant default response
     * @throws ApiError
     */
    public getAllAvailableTenants(): Observable<Array<Tenant>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tenants',
        });
    }

    /**
     * @returns Project default response
     * @throws ApiError
     */
    public getAllProjects(): Observable<Array<Project>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tenants/projects',
        });
    }

    /**
     * @param id
     * @returns Tenant default response
     * @throws ApiError
     */
    public getAvailableTenantsOfUser(
        id: string,
    ): Observable<Array<Tenant>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tenants/user/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns Tenant default response
     * @throws ApiError
     */
    public getCurrentTenant(): Observable<Tenant> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tenants/current',
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public selectTenant(
        requestBody?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/tenants/current',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns ProjectMemberResponse default response
     * @throws ApiError
     */
    public getProjectMembers(
        id: string,
    ): Observable<Array<ProjectMemberResponse>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tenants/project/{id}/members',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param requestBody
     * @returns Project default response
     * @throws ApiError
     */
    public readProject(
        requestBody?: Project,
    ): Observable<Project> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tenants/project',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns Project default response
     * @throws ApiError
     */
    public saveProject(
        requestBody?: Project,
    ): Observable<Project> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/tenants/project',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns Project default response
     * @throws ApiError
     */
    public searchProjectByAttributes(
        requestBody?: Record<string, string>,
    ): Observable<Project> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/tenants/project/search',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
