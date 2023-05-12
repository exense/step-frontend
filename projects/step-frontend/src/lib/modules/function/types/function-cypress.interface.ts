import { DynamicValueString, Function } from '@exense/step-core';
import { FunctionType } from './function-type.enum';

export interface FunctionCypress extends Omit<Function, 'type'> {
  type: FunctionType.CYPRESS;
  command: DynamicValueString;
  cypressProject: DynamicValueString;
  baseUrl: DynamicValueString;
}
