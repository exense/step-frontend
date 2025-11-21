import { TableParameters } from '@exense/step-core';

export type ActivatableEntitiesTableParameters = TableParameters & {
  evaluateActivation: boolean;
  bindings?: Record<string, string>;
};

const BASE_ACTIVABLE_ENTITIES_TABLE_PARAMS: ActivatableEntitiesTableParameters = Object.freeze({
  type: 'step.core.table.ActivableEntitiesTableParameters',
  evaluateActivation: true,
});

const normalizeBindings = (bindings?: Record<string, any>): Record<string, string> | undefined => {
  if (!bindings) {
    return undefined;
  }

  const entries = Object.entries(bindings)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => [key, String(value)] as [string, string]);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

export const createActivatableEntitiesTableParams = (
  bindings?: Record<string, any>,
): ActivatableEntitiesTableParameters => {
  const normalizedBindings = normalizeBindings(bindings);
  if (!normalizedBindings) {
    return BASE_ACTIVABLE_ENTITIES_TABLE_PARAMS;
  }
  return {
    ...BASE_ACTIVABLE_ENTITIES_TABLE_PARAMS,
    bindings: normalizedBindings,
  };
};
