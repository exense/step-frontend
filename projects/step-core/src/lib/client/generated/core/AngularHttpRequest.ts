/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import type { ApiRequestOptions } from './ApiRequestOptions';
import { BaseHttpRequest } from './BaseHttpRequest';
import type { OpenAPIConfig } from './OpenAPI';
import { OpenAPI } from './OpenAPI';
import { request as __request } from './request';

@Injectable()
export class AngularHttpRequest extends BaseHttpRequest {

    constructor(
        @Inject(OpenAPI)
        config: OpenAPIConfig,
        http: HttpClient,
    ) {
        super(config, http);
    }

    /**
     * Request method
     * @param options The request options from the service
     * @returns Observable<T>
     * @throws ApiError
     */
    public override request<T>(options: ApiRequestOptions): Observable<T> {
        return __request(this.config, this.http, options);
    }
}
