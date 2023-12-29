import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { AugmentedPlansService, Plan } from '@exense/step-core';

export const planResolver: ResolveFn<Plan | undefined> = (route) => {
  const _plansService = inject(AugmentedPlansService);

  const id = route.params['id'];
  if (!id) {
    return undefined;
  }

  return _plansService.getPlanById(id);
};
