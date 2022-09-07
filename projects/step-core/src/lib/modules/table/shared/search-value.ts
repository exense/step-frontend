import { FilterCondition } from './filter-condition';

export type SearchValue = string | { regex?: boolean; value: string } | FilterCondition;
