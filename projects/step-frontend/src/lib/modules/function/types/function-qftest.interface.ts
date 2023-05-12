import { DynamicValueString, Function } from '@exense/step-core';
import { FunctionType } from './function-type.enum';

export interface FunctionQFTest extends Omit<Function, 'type'> {
  type: FunctionType.QF_TEST;
  suite: DynamicValueString;
  transferSuiteToAgents: boolean;
  procedure: DynamicValueString;
}
