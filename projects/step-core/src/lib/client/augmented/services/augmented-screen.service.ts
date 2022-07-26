import { Injectable } from '@angular/core';
import { Input, ScreensService } from '../../generated';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AugmentedScreenService extends ScreensService {
  private screenCache: Record<string, Input[]> = {};

  clearCache(): void {
    this.screenCache = {};
  }

  override getInputsForScreen1(id: string, requestBody?: any): Observable<Input[]> {
    if (!requestBody && !!this.screenCache[id]) {
      return of(this.screenCache[id]);
    }
    return super.getInputsForScreen1(id, requestBody).pipe(tap((inputs) => (this.screenCache[id] = inputs)));
  }
}
