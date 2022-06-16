/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Plan } from './Plan';
import type { PlanCompilationError } from './PlanCompilationError';

export type PlanCompilationResult = {
    hasError?: boolean;
    errors?: Array<PlanCompilationError>;
    plan?: Plan;
};

