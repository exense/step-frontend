/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AiTestCaseInput } from './AiTestCaseInput';

/**
 * Either testCases (structured form mode) or specText (free text mode) must be provided, but not both.
 */
export type AiGenerateRequest = {
  testCases?: Array<AiTestCaseInput>;
  specText?: string;
  hints?: string;
};
