import { inject, Injectable, OnDestroy } from '@angular/core';
import { Input, ScreenInput, ScreensService } from '../../generated';
import { map, Observable, of, OperatorFunction, pipe, switchMap, tap, UnaryFunction } from 'rxjs';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { HttpEvent } from '@angular/common/http';
import { Reloadable } from '../../../modules/basics/types/reloadable';
import { GlobalReloadService } from '../../../modules/basics/injectables/global-reload.service';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';

@Injectable({
  providedIn: 'root',
})
export class AugmentedScreenService
  extends ScreensService
  implements HttpOverrideResponseInterceptor, Reloadable, OnDestroy
{
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);
  private _globalReload = inject(GlobalReloadService);

  private screenCache: Record<string, Input[]> = {};
  private screenInputCache: Record<string, ScreenInput[]> = {};
  private cachedScreenInput?: ScreenInput;

  clearCache(): void {
    this.screenCache = {};
    this.screenInputCache = {};
  }

  clearCachedScreenInput(): void {
    this.cachedScreenInput = undefined;
  }

  // eslint-disable-next-line @angular-eslint/prefer-inject -- The generated base service requires this constructor dependency.
  constructor(httpRequest: BaseHttpRequest) {
    super(httpRequest);
    this._globalReload.register(this);
  }

  reload(): void {
    this.clearCache();
  }

  ngOnDestroy(): void {
    this._globalReload.unRegister(this);
  }

  clearCacheForScreen(screenId?: string): void {
    if (screenId && this.screenCache[screenId]) {
      delete this.screenCache[screenId];
    }
    if (screenId && this.screenInputCache[screenId]) {
      delete this.screenInputCache[screenId];
    }
  }

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  getInputCached(id: string): Observable<ScreenInput> {
    if (this.cachedScreenInput && this.cachedScreenInput.id === id) {
      return of(this.cachedScreenInput);
    }
    return super.getInput(id).pipe(tap((screenInput) => (this.cachedScreenInput = screenInput)));
  }

  override getInputsForScreenPost(id: string, requestBody?: any): Observable<Input[]> {
    if (!requestBody && !!this.screenCache[id]) {
      return of(this.screenCache[id]);
    }
    return super.getInputsForScreenPost(id, requestBody).pipe(
      tap((inputs) => {
        Object.freeze(inputs);
        this.screenCache[id] = inputs;
      }),
    );
  }

  getScreenInputsByScreenIdWithCache(id: string): Observable<Array<ScreenInput>> {
    if (!!this.screenInputCache[id]) {
      return of(this.screenInputCache[id]);
    }
    return super.getScreenInputsByScreenId(id).pipe(
      tap((inputs) => {
        Object.freeze(inputs);
        this.screenInputCache[id] = inputs;
      }),
    );
  }

  override saveInput(requestBody?: ScreenInput): Observable<any> {
    const screenId = requestBody?.screenId;
    return super.saveInput(requestBody).pipe(this.clearCacheForScreenPipe(screenId));
  }

  override moveInput(id: string, requestBody?: number, screenId?: string): Observable<any> {
    return super.moveInput(id, requestBody).pipe(this.clearCacheForScreenPipe(screenId));
  }

  override deleteInput(id: string, screenId?: string): Observable<any> {
    return super.deleteInput(id).pipe(this.clearCacheForScreenPipe(screenId));
  }

  getDefaultParametersByScreenId(screenId: string): Observable<Record<string, string>> {
    return this.getActivatedScreenInputs(screenId).pipe(
      map((inputs) =>
        inputs
          .map((item) => item.input)
          .filter((input) => !!input)
          .reduce(
            (res, input) => {
              const defaultValue = input?.defaultValue;
              const options = input?.options;

              let value = '';

              if (defaultValue) {
                value = defaultValue;
              } else if (!!options?.length) {
                value = options[0].value!;
              }

              res[input!.id!] = value;
              return res;
            },
            {} as Record<string, any>,
          ),
      ),
    );
  }

  getActivatedScreenInputs(screenId: string, parameters: Record<string, unknown> = {}): Observable<ScreenInput[]> {
    return this.getScreenInputsByScreenIdWithCache(screenId).pipe(
      switchMap((definitions) => {
        const defaults = definitions.reduce(
          (result, { input }) => {
            const value = input?.type === 'CHECKBOX' ? (input.defaultValue ?? false) : input?.defaultValue;
            if (input?.id && value !== undefined && value !== null) {
              result[input.id] = value;
            }
            return result;
          },
          {} as Record<string, unknown>,
        );
        return this.getScreenInputsForScreenPost(screenId, { ...defaults, ...parameters });
      }),
    );
  }

  filterInactiveParameters(
    screenId: string,
    parameters: Record<string, string> = {},
  ): Observable<Record<string, string>> {
    return this.getScreenInputsByScreenIdWithCache(screenId).pipe(
      switchMap((definitions) => {
        const conditionalKeys = definitions
          .filter((item) => !!item.input?.activationExpression)
          .map((item) => item.input!.id!);
        if (!conditionalKeys.length) {
          return of(parameters);
        }
        return this.getActivatedScreenInputs(screenId, parameters).pipe(
          map((inputs) => {
            const activeKeys = new Set(inputs.map((item) => item.input?.id));
            const result = { ...parameters };
            conditionalKeys.forEach((key) => {
              if (!activeKeys.has(key)) {
                delete result[key];
              }
            });
            return result;
          }),
        );
      }),
    );
  }

  private clearCacheForScreenPipe(screenId?: string): UnaryFunction<Observable<unknown>, Observable<unknown>> {
    return pipe(tap(() => this.clearCacheForScreen(screenId)));
  }
}
