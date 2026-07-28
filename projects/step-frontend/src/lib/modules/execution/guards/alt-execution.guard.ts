import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { map, of, switchMap } from 'rxjs';
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
    console.error('Execution ID not found (beta)', state.url);
    return true;
  }

  return _executionService.getExecutionViaOverviewCached(executionId).pipe(
    switchMap((execution) => {
      if (!execution) {
        return of(_router.parseUrl('/executions/list'));
      }
      return _executionViewMode.getExecutionMode(execution);
    }),
    map((mode) => {
      if (mode instanceof UrlTree) {
        return mode;
      }
      if (mode === ExecutionViewMode.NEW) {
        return true;
      }
      const url = state.url.replace('/executions', '/legacy-executions');
      return _router.parseUrl(url);
    }),
  );
};
