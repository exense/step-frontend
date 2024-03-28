import { Injectable } from '@angular/core';
import { Input, ScreenInput, ScreensService } from '../../generated';
import { map, Observable, of, pipe, tap, UnaryFunction } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AugmentedScreenService extends ScreensService {
  private screenCache: Record<string, Input[]> = {};
  private screenInputCache: Record<string, ScreenInput[]> = {};

  clearCache(): void {
    this.screenCache = {};
    this.screenInputCache = {};
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
    return super.saveInput(requestBody).pipe(this.clearCacheForScreen(screenId));
  }

  override moveInput(id: string, requestBody?: number, screenId?: string): Observable<any> {
    return super.moveInput(id, requestBody).pipe(this.clearCacheForScreen(screenId));
  }

  override deleteInput(id: string, screenId?: string): Observable<any> {
    return super.deleteInput(id).pipe(this.clearCacheForScreen(screenId));
  }

  getDefaultParametersByScreenId(screenId: string): Observable<Record<string, string>> {
    return this.getScreenInputsByScreenId(screenId).pipe(
      map((inputs) =>
        inputs
          .map((x) => x.input)
          .filter((x) => !!x)
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

  private clearCacheForScreen(screenId?: string): UnaryFunction<Observable<unknown>, Observable<unknown>> {
    return pipe(
      tap(() => {
        if (screenId && this.screenCache[screenId]) {
          delete this.screenCache[screenId];
        }
        if (screenId && this.screenInputCache[screenId]) {
          delete this.screenInputCache[screenId];
        }
      }),
    );
  }
}
