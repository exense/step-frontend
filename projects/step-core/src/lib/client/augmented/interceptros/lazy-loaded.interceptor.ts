import { HttpInterceptorFn } from '@angular/common/http';
import {
  computed,
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  makeEnvironmentProviders,
  runInInjectionContext,
  signal,
} from '@angular/core';

const chainInterceptor = (
  tail: HttpInterceptorFn,
  current: HttpInterceptorFn,
  injector: Injector,
): HttpInterceptorFn => {
  return (req, next) =>
    runInInjectionContext(injector, () => current(req, (downstreamRequest) => tail(downstreamRequest, next)));
};

const chainEnd: HttpInterceptorFn = (req, next) => next(req);

@Injectable({
  providedIn: 'root',
})
class LazyLoadedInterceptorsContextService {
  private _injector = inject(Injector);
  private interceptors = signal<HttpInterceptorFn[]>([]);

  readonly chain = computed(() => {
    const interceptors = this.interceptors();
    if (!interceptors.length) {
      return undefined;
    }
    return this.rebuildChain(interceptors);
  });

  register(interceptor: HttpInterceptorFn) {
    this.interceptors.update((value) => {
      if (value.includes(interceptor)) {
        return value;
      }
      return [...value, interceptor];
    });
  }

  private rebuildChain(interceptor: HttpInterceptorFn[]): HttpInterceptorFn {
    return interceptor.reduceRight((res, interceptor) => chainInterceptor(res, interceptor, this._injector), chainEnd);
  }
}

export const lazyLoadedMainInterceptor: HttpInterceptorFn = (req, next) => {
  const _lazyLoadInterceptorsContext = inject(LazyLoadedInterceptorsContextService);
  const chain = _lazyLoadInterceptorsContext.chain();
  if (!chain) {
    return next(req);
  }
  return chain(req, next);
};

export const LAZY_LOAD_INTERCEPTORS = new InjectionToken<HttpInterceptorFn[]>(
  'Token to register lazy loaded interceptors as providers',
);

export const provideLazyLoadedInterceptor = (interceptor: HttpInterceptorFn): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: LAZY_LOAD_INTERCEPTORS,
      useFactory: () => {
        const context = inject(LazyLoadedInterceptorsContextService);
        context.register(interceptor);
        return interceptor;
      },
      multi: true,
    },
  ]);
