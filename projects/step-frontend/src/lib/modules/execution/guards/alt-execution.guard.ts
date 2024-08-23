import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ExecutionViewModeService } from '../services/execution-view-mode.service';
import { map } from 'rxjs';
import { ExecutionViewMode } from '@exense/step-core';

export const altExecutionGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const _executionViewMode = inject(ExecutionViewModeService);
  return _executionViewMode.loadExecutionMode().pipe(
    map((mode) => {
      if (mode === ExecutionViewMode.NEW) {
        return true;
      }
      const url = state.url.replace('/alt-executions', '/executions');
      return _router.parseUrl(url);
    }),
  );
};