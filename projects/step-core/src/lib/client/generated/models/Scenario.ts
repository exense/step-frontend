/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Region } from './Region';
import type { TestScenario } from './TestScenario';

export type Scenario = {
    name?: string;
    performImageDiff?: boolean;
    regions?: Array<Region>;
    anchorType?: 'IMAGE_BASED' | 'PAGE_NUMBER_BASED' | 'APPLIES_TO_ALL_PAGES';
    anchors?: Array<Region>;
    testScenario?: TestScenario;
};

