import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { ExecutionViewMode, ExecutionViewModeService } from '@exense/step-core';

export const executionGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const _executionViewMode: ExecutionViewModeService = inject(ExecutionViewModeService);

  return _executionViewMode.loadExecutionMode().pipe(
    switchMap(() => {
      const urlSegments = state.url.split('/');
      const executionId = urlSegments[urlSegments.length - 1];
      console.log(' executionId', executionId);

      return _executionViewMode.resolveExecution(executionId).pipe(
        map((execution) => {
          console.log('execution', execution);

          const mode = _executionViewMode.getExecutionMode(execution);

          if (mode !== ExecutionViewMode.LEGACY) {
            let url = state.url.replace('/legacy-executions', '/executions');
            if (url.includes('/open')) {
              url = url.replace('/open', '');
            }
            return _router.parseUrl(url);
          }

          return true;
        }),
      );
    }),
  );
};
