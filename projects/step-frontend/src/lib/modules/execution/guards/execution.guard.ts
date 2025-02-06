import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, of, switchMap } from 'rxjs';
import { ExecutionViewMode, ExecutionViewModeService } from '@exense/step-core';

export const executionGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const _executionViewMode: ExecutionViewModeService = inject(ExecutionViewModeService);

  return _executionViewMode.loadExecutionMode().pipe(
    switchMap(() => {
      let executionId: string;
      const urlSegments = state.url.split('/');
      const executionIndex = urlSegments.indexOf('legacy-executions');

      if (executionIndex !== -1 && executionIndex + 1 < urlSegments.length) {
        executionId = urlSegments[executionIndex + 1];
      } else {
        console.error('Execution ID not found');
        return of(true);
      }

      return _executionViewMode.resolveExecution(executionId).pipe(
        map((execution) => {
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
