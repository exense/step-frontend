/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { AggregationRequest } from '../models/AggregationRequest';
import type { ComparisonRequest } from '../models/ComparisonRequest';
import type { DirectMongoQuery } from '../models/DirectMongoQuery';
import type { FileVersion } from '../models/FileVersion';
import type { FileVersionId } from '../models/FileVersionId';
import type { FormDataContentDisposition } from '../models/FormDataContentDisposition';
import type { ProxiedRequest } from '../models/ProxiedRequest';
import type { RegistrationMessage } from '../models/RegistrationMessage';
import type { RTMLink } from '../models/RTMLink';
import type { SelectTokenArgument } from '../models/SelectTokenArgument';
import type { StreamId } from '../models/StreamId';
import type { TokenWrapper } from '../models/TokenWrapper';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class DefaultService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param collection
     * @param name
     * @returns any default response
     * @throws ApiError
     */
    public loadObject(
        collection: string,
        name?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/viz/crud/{collection}',
            path: {
                'collection': collection,
            },
            query: {
                'name': name,
            },
        });
    }

    /**
     * @param collection
     * @param name
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public saveObject(
        collection: string,
        name?: string,
        requestBody?: Record<string, any>,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/viz/crud/{collection}',
            path: {
                'collection': collection,
            },
            query: {
                'name': name,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param collection
     * @param name
     * @returns any default response
     * @throws ApiError
     */
    public deleteObject(
        collection: string,
        name?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/viz/crud/{collection}',
            path: {
                'collection': collection,
            },
            query: {
                'name': name,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public driverQuery(
        requestBody?: DirectMongoQuery,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/viz/driver',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param collection
     * @returns any default response
     * @throws ApiError
     */
    public getAll(
        collection: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/viz/crud/all/{collection}',
            path: {
                'collection': collection,
            },
        });
    }

    /**
     * @param collection
     * @returns any default response
     * @throws ApiError
     */
    public getData(
        collection: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/viz/crud/paged/{collection}',
            path: {
                'collection': collection,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public proxyQuery(
        requestBody?: ProxiedRequest,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/viz/proxy',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param path
     * @returns any default response
     * @throws ApiError
     */
    public getExternalGrammar(
        path: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/application.wadl/{path}',
            path: {
                'path': path,
            },
        });
    }

    /**
     * @returns any default response
     * @throws ApiError
     */
    public getWadl(): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/application.wadl',
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public getAggregationResutStream(
        requestBody?: AggregationRequest,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/aggregate/get',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public getComparisonResutStream(
        requestBody?: ComparisonRequest,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/aggregate/compare',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public refreshResutStreamForId(
        requestBody?: StreamId,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/aggregate/refresh',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any default response
     * @throws ApiError
     */
    public getConfigurationGet(): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/configuration/getConfiguration',
        });
    }

    /**
     * @returns any default response
     * @throws ApiError
     */
    public getConfigurationPost(): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/configuration/getConfiguration',
        });
    }

    /**
     * @param propertyName
     * @returns any default response
     * @throws ApiError
     */
    public getPeropertyGet(
        propertyName?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/configuration/getProperty',
            query: {
                'propertyName': propertyName,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public getPropertyPost(
        requestBody?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/configuration/getProperty',
            body: requestBody,
            mediaType: '*/*',
        });
    }

    /**
     * @returns any default response
     * @throws ApiError
     */
    public versionGet(): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/configuration/version',
        });
    }

    /**
     * @returns any default response
     * @throws ApiError
     */
    public versionPost(): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/configuration/version',
        });
    }

    /**
     * @param measurement
     * @returns any default response
     * @throws ApiError
     */
    public saveGenericMeasurementGet(
        measurement?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/ingest/generic',
            query: {
                'measurement': measurement,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public saveGenericMeasurementPost(
        requestBody?: {
            measurement?: string;
        },
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/ingest/generic',
            body: requestBody,
            mediaType: '*/*',
        });
    }

    /**
     * @param eId
     * @param time
     * @param name
     * @param value
     * @returns any default response
     * @throws ApiError
     */
    public saveStructuredMeasurementGet(
        eId: string,
        time: string,
        name: string,
        value: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/ingest/structured/{eId}/{time}/{name}/{value}',
            path: {
                'eId': eId,
                'time': time,
                'name': name,
                'value': value,
            },
        });
    }

    /**
     * @param eId
     * @param time
     * @param name
     * @param value
     * @param optionalData
     * @returns any default response
     * @throws ApiError
     */
    public saveStructuredMeasurementWithOptionalGet(
        eId: string,
        time: string,
        name: string,
        value: string,
        optionalData: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/ingest/structured/{eId}/{time}/{name}/{value}/{optionalData}',
            path: {
                'eId': eId,
                'time': time,
                'name': name,
                'value': value,
                'optionalData': optionalData,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public saveStructuredMeasurementWithOptionalPost(
        requestBody?: {
            eId?: string;
            time?: string;
            name?: string;
            value?: string;
            optionalData?: string;
        },
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/ingest/structured',
            body: requestBody,
            mediaType: '*/*',
        });
    }

    /**
     * @param formData
     * @returns any default response
     * @throws ApiError
     */
    public exportForm(
        formData?: {
            value?: string;
        },
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/measurement/export',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public getLatestMeasurements(
        requestBody?: AggregationRequest,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/measurement/latest',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public getMeasurements(
        requestBody?: AggregationRequest,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/measurement/find',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param version
     * @returns any default response
     * @throws ApiError
     */
    public getFile(
        id: string,
        version: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/grid/file/{id}/{version}',
            path: {
                'id': id,
                'version': version,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public getRegisteredFile(
        requestBody?: FileVersionId,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/grid/file/content',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns TokenWrapper default response
     * @throws ApiError
     */
    public getTokens(): Observable<Array<TokenWrapper>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/grid/token/list',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public markTokenAsFailing(
        id: string,
        requestBody?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/grid/token/{id}/error/add',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: '*/*',
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public register(
        requestBody?: RegistrationMessage,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/grid/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param type
     * @param formData
     * @returns FileVersion default response
     * @throws ApiError
     */
    public registerFile(
        type?: string,
        formData?: {
            file?: FormDataContentDisposition;
        },
    ): Observable<FileVersion> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/grid/file/register',
            query: {
                'type': type,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public returnToken(
        requestBody?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/grid/token/return',
            body: requestBody,
            mediaType: '*/*',
        });
    }

    /**
     * @param requestBody
     * @returns TokenWrapper default response
     * @throws ApiError
     */
    public selectToken(
        requestBody?: SelectTokenArgument,
    ): Observable<TokenWrapper> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/grid/token/select',
            body: requestBody,
            mediaType: '*/*',
        });
    }

    /**
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public unregisterFile(
        requestBody?: FileVersionId,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/grid/file/unregister',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns RTMLink default response
     * @throws ApiError
     */
    public getRtmLink(
        id: string,
    ): Observable<RTMLink> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rtm/rtmlink/{id}',
            path: {
                'id': id,
            },
        });
    }

}
