import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ExecutionViewModeService } from '@exense/step-core';

export const executionDeactivateGuard: CanActivateFn = () => {
  inject(ExecutionViewModeService).cleanup();
  return true;
};
