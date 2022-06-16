/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import type { ApiRequestOptions } from './ApiRequestOptions';
import type { OpenAPIConfig } from './OpenAPI';

export abstract class BaseHttpRequest {

    constructor(
        public readonly config: OpenAPIConfig,
        public readonly http: HttpClient,
    ) {}

    public abstract request<T>(options: ApiRequestOptions): Observable<T>;
}
