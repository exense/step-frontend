import { InjectionToken } from '@angular/core';

export const AGGREGATED_TREE_NODE_LARGE_VIEW = new InjectionToken<boolean>('AGGREGATED_TREE_NODE_LARGE_VIEW', {
  factory: () => true,
});
