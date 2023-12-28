/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { inject, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AngularHttpRequest } from './core/AngularHttpRequest';
import { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { OpenAPI } from './core/OpenAPI';
import { DOCUMENT } from '@angular/common';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    {
      provide: OpenAPI,
      useFactory: () => {
        const document = inject(DOCUMENT);
        let root = document.baseURI.replace(location.origin, '');
        root = root.endsWith('/') ? root : `${root}/`;
        return {
          BASE: `${root}${OpenAPI?.BASE ?? 'rest'}`,
          VERSION: OpenAPI?.VERSION ?? '3.23.0',
          WITH_CREDENTIALS: OpenAPI?.WITH_CREDENTIALS ?? false,
          CREDENTIALS: OpenAPI?.CREDENTIALS ?? 'include',
          TOKEN: OpenAPI?.TOKEN,
          USERNAME: OpenAPI?.USERNAME,
          PASSWORD: OpenAPI?.PASSWORD,
          HEADERS: OpenAPI?.HEADERS,
          ENCODE_PATH: OpenAPI?.ENCODE_PATH,
        } as OpenAPIConfig;
      },
    },
    {
      provide: BaseHttpRequest,
      useClass: AngularHttpRequest,
    },
  ],
})
export class StepGeneratedClientModule {}
