import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ExecutionViewModeService } from '../services/execution-view-mode.service';

export const executionDeactivateGuard: CanActivateFn = () => {
  inject(ExecutionViewModeService).cleanup();
  return true;
};
