import { CanDeactivateFn } from '@angular/router';
import { EntityActionInvokerService, Plan, PlanAction } from '@exense/step-core';
import { inject } from '@angular/core';

export const planDeactivate: CanDeactivateFn<unknown> = (_, currentRoute) => {
  const _entityActionInvoker = inject(EntityActionInvokerService);

  const plan = currentRoute.data['plan'] as Plan;
  if (!plan) {
    return true;
  }

  return _entityActionInvoker.invokeAction('plans', PlanAction.BEFORE_UNLOAD, plan);
};
