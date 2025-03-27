import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, switchMap, tap } from 'rxjs';
import { AugmentedExecutionsService, ExecutionViewMode, ExecutionViewModeService } from '@exense/step-core';

export const altExecutionGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const _executionService = inject(AugmentedExecutionsService);
  const _executionViewMode = inject(ExecutionViewModeService);

  let executionId: string;
  const urlSegments = state.url.split('/');
  const executionIndex = urlSegments.indexOf('executions');

  if (executionIndex !== -1 && executionIndex + 1 < urlSegments.length) {
    executionId = urlSegments[executionIndex + 1];
  } else {
    console.error('Execution ID not found');
    return true;
  }

  return _executionService.getExecutionByIdCached(executionId).pipe(
    switchMap((execution) => _executionViewMode.getExecutionMode(execution)),
    map((mode) => {
      if (mode === ExecutionViewMode.NEW) {
        return true;
      }
      const url = state.url.replace('/executions', '/legacy-executions');
      return _router.parseUrl(url);
    }),
  );
};
