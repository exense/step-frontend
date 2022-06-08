/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable()
export class PlanEditorService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param requestBody
     * @returns string default response
     * @throws ApiError
     */
    public autocomplete(
        requestBody?: string,
    ): Observable<Array<string>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/planeditor/autocomplete',
            body: requestBody,
            mediaType: '*/*',
        });
    }

}
