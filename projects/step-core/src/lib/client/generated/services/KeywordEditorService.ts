/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({providedIn:'root'})
export class KeywordEditorService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param functionid
     * @returns string default response
     * @throws ApiError
     */
    public getFunctionScript(
        functionid: string,
    ): Observable<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/scripteditor/function/{functionid}/file',
            path: {
                'functionid': functionid,
            },
        });
    }

    /**
     * @param functionid
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public saveFunctionScript(
        functionid: string,
        requestBody?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/scripteditor/function/{functionid}/file',
            path: {
                'functionid': functionid,
            },
            body: requestBody,
            mediaType: '*/*',
        });
    }

    /**
     * @param filename
     * @returns string default response
     * @throws ApiError
     */
    public getScript(
        filename: string,
    ): Observable<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/scripteditor/file/{filename}',
            path: {
                'filename': filename,
            },
        });
    }

    /**
     * @param filename
     * @param requestBody
     * @returns any default response
     * @throws ApiError
     */
    public saveScript(
        filename: string,
        requestBody?: string,
    ): Observable<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/scripteditor/file/{filename}',
            path: {
                'filename': filename,
            },
            body: requestBody,
            mediaType: '*/*',
        });
    }

}
