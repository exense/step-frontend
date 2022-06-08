/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ComparisonSettings } from './ComparisonSettings';

export type TestScenario = {
    actualFile?: string;
    expectedFile?: string;
    pages?: string;
    comparisonSettings?: ComparisonSettings;
};

