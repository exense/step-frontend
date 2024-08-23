import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ExecutionViewModeService } from '../services/execution-view-mode.service';
import { map } from 'rxjs';
import { ExecutionViewMode } from '@exense/step-core';

export const executionGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const _executionViewMode = inject(ExecutionViewModeService);
  return _executionViewMode.loadExecutionMode().pipe(
    map((mode) => {
      if (mode === ExecutionViewMode.LEGACY) {
        return true;
      }
      let url = state.url.replace('/executions', '/alt-executions');
      if (url.includes('/open')) {
        url = url.replace('/open', '');
      }
      return _router.parseUrl(url);
    }),
  );
};
