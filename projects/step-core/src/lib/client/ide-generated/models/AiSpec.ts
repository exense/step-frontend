/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type AiSpec = {
  testCaseName?: string;
  spec?: string;
  /**
   * False when no spec is stored for this test case, which is a normal situation.
   */
  exists?: boolean;
  specFile?: string;
};
