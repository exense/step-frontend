import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { ExecutionViewMode, ExecutionViewModeService } from '@exense/step-core';

export const altExecutionGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const _executionViewMode = inject(ExecutionViewModeService);
  return _executionViewMode.loadExecutionMode().pipe(
    map((mode) => {
      if (mode === ExecutionViewMode.NEW) {
        return true;
      }
      const url = state.url.replace('/executions', '/legacy-executions');
      return _router.parseUrl(url);
    }),
  );
};
