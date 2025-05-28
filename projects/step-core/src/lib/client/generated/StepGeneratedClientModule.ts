/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AngularHttpRequest } from './core/AngularHttpRequest';
import { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { OpenAPI } from './core/OpenAPI';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    {
      provide: OpenAPI,
      useValue: {
        BASE: OpenAPI?.BASE ?? 'rest',
        VERSION: OpenAPI?.VERSION ?? '3.28.0',
        WITH_CREDENTIALS: OpenAPI?.WITH_CREDENTIALS ?? false,
        CREDENTIALS: OpenAPI?.CREDENTIALS ?? 'include',
        TOKEN: OpenAPI?.TOKEN,
        USERNAME: OpenAPI?.USERNAME,
        PASSWORD: OpenAPI?.PASSWORD,
        HEADERS: OpenAPI?.HEADERS,
        ENCODE_PATH: OpenAPI?.ENCODE_PATH,
      } as OpenAPIConfig,
    },
    {
      provide: BaseHttpRequest,
      useClass: AngularHttpRequest,
    },
  ],
})
export class StepGeneratedClientModule {}
