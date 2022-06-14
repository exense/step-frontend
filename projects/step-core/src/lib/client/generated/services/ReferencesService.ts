/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type { FindReferencesRequest } from '../models/FindReferencesRequest';
import type { FindReferencesResponse } from '../models/FindReferencesResponse';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({providedIn:'root'})
export class ReferencesService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param requestBody
     * @returns FindReferencesResponse default response
     * @throws ApiError
     */
    public findReferences(
        requestBody?: FindReferencesRequest,
    ): Observable<Array<FindReferencesResponse>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/references/findReferences',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
