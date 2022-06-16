/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { BaseHttpRequest } from '../core/BaseHttpRequest';

@Injectable({providedIn:'root'})
export class ImportsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @param entity
     * @param path
     * @param importAll
     * @param overwrite
     * @returns string default response
     * @throws ApiError
     */
    public importEntity(
        entity: string,
        path?: string,
        importAll?: boolean,
        overwrite?: boolean,
    ): Observable<Array<string>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/import/{entity}',
            path: {
                'entity': entity,
            },
            query: {
                'path': path,
                'importAll': importAll,
                'overwrite': overwrite,
            },
        });
    }

}
