import { makeEnvironmentProviders } from '@angular/core';

import { StepHttpRequestService } from './augmented';
import {
  HttpFeature,
  HttpFeatureKind,
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { BaseHttpRequest } from './generated/core/BaseHttpRequest';
import { OPEN_API_CONFIG_PROVIDER } from './generated/open-api-config.provider';
import { lazyLoadedMainInterceptor } from './augmented/interceptros/lazy-loaded.interceptor';

export * from './generated/core/BaseHttpRequest';
export { ApiError } from './generated/core/ApiError';
export * from './generated/index';
export * from './async-task/async-task.module';
export * from './augmented';
export { provideLazyLoadedInterceptor, LAZY_LOAD_INTERCEPTORS } from './augmented/interceptros/lazy-loaded.interceptor';
export * from './table';
export * from './_common';
export * from './websockets';

export const provideStepApi = (...features: HttpFeature<HttpFeatureKind>[]) =>
  makeEnvironmentProviders([
    provideHttpClient(withInterceptorsFromDi(), withInterceptors([lazyLoadedMainInterceptor]), ...features),
    OPEN_API_CONFIG_PROVIDER,
    {
      provide: BaseHttpRequest,
      useExisting: StepHttpRequestService,
    },
  ]);
