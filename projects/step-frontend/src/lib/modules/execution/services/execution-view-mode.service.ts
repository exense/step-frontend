import { inject, Injectable, Provider } from '@angular/core';
import { UserService, ExecutionViewMode, EXECUTION_VIEW_MODE, Mutable } from '@exense/step-core';
import { map, Observable, of, tap } from 'rxjs';

type FieldAccessor = Mutable<Pick<ExecutionViewModeService, 'mode'>>;

@Injectable({
  providedIn: 'root',
})
export class ExecutionViewModeService {
  private _userService = inject(UserService);

  readonly mode?: ExecutionViewMode;

  loadExecutionMode(): Observable<ExecutionViewMode> {
    if (this.mode) {
      return of(this.mode);
    }
    return this._userService.getPreferences().pipe(
      map((preferences) => preferences?.preferences?.['execution_report_beta'] === 'true'),
      map((isNewMode) => (isNewMode ? ExecutionViewMode.NEW : ExecutionViewMode.LEGACY)),
      tap((mode) => ((this as FieldAccessor).mode = mode)),
    );
  }

  cleanup(): void {
    (this as FieldAccessor).mode = undefined;
  }
}

export const provideExecutionViewMode = (): Provider[] => [
  {
    provide: EXECUTION_VIEW_MODE,
    useFactory: () => inject(ExecutionViewModeService).mode ?? ExecutionViewMode.LEGACY,
  },
];
