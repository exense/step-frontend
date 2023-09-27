import { Injectable } from '@angular/core';
import { AugmentedScreenService, Input } from '@exense/step-core';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export abstract class ReportNodeCommonsService {
  private functionAttributes?: Input[];

  constructor(private _screenService: AugmentedScreenService) {}

  getFunctionAttributes(): Observable<Input[]> {
    if (this.functionAttributes) {
      return of(this.functionAttributes);
    }
    return this.loadFunctionAttributes();
  }

  private loadFunctionAttributes(): Observable<Input[]> {
    return this._screenService.getInputsForScreenPost('functionTable').pipe(
      tap((functionAttributes) => [...functionAttributes].sort((a, b) => (a?.id || '').localeCompare(b?.id || ''))),
      tap((functionAttributes) => (this.functionAttributes = functionAttributes))
    );
  }
}
