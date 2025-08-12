import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, of, switchMap } from 'rxjs';
import { AugmentedExecutionsService, ExecutionViewMode, ExecutionViewModeService } from '@exense/step-core';

export const legacyExecutionGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const _executionService = inject(AugmentedExecutionsService);
  const _executionViewMode: ExecutionViewModeService = inject(ExecutionViewModeService);

  let executionId: string;
  const urlSegments = state.url.split('/');
  const executionIndex = urlSegments.indexOf('legacy-executions');

  if (executionIndex !== -1 && executionIndex + 1 < urlSegments.length) {
    executionId = urlSegments[executionIndex + 1];
  } else {
    console.error('Execution ID not found (legacy)', state.url);
    return of(true);
  }

  return _executionService.getExecutionByIdCached(executionId).pipe(
    switchMap((execution) =>
      _executionViewMode.getExecutionMode(execution).pipe(
        map((mode) => {
          if (mode !== ExecutionViewMode.LEGACY) {
            let url = state.url.replace('/legacy-executions', '/executions');
            if (url.includes('/open')) {
              url = url.replace('/open', '');
            }
            return _router.parseUrl(url);
          }
          return true;
        }),
      ),
    ),
  );
};
