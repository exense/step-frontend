import { InjectionToken } from '@angular/core';
import { RequestFilterInterceptor } from '../shared/request-filter-interceptor';

export const REQUEST_FILTERS_INTERCEPTORS = new InjectionToken<RequestFilterInterceptor[]>(
  'Request filter interceptor token',
);
