import { InjectionToken } from '@angular/core';

export type ExecutionTreePaging = Record<string, { skip: number }>;

export const EXECUTION_TREE_PAGING = new InjectionToken<ExecutionTreePaging>('Execution tree paging');

export const EXECUTION_TREE_PAGE_LIMIT = 1000;
