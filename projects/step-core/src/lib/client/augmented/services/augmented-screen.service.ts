import { Injectable } from '@angular/core';
import { Input, ScreensService } from '../../generated';
import { map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AugmentedScreenService extends ScreensService {
  private screenCache: Record<string, Input[]> = {};

  clearCache(): void {
    this.screenCache = {};
  }

  override getInputsForScreenPost(id: string, requestBody?: any): Observable<Input[]> {
    if (!requestBody && !!this.screenCache[id]) {
      return of(this.screenCache[id]);
    }
    return super.getInputsForScreenPost(id, requestBody).pipe(tap((inputs) => (this.screenCache[id] = inputs)));
  }

  getDefaultParametersByScreenId(screenId: string): Observable<Record<string, string>> {
    return this.getScreenInputsByScreenId(screenId).pipe(
      map((inputs) =>
        inputs
          .map((x) => x.input)
          .filter((x) => !!x)
          .reduce((res, input) => {
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
          }, {} as Record<string, any>)
      )
    );
  }
}
