import { DynamicValueString, Function } from '@exense/step-core';
import { FunctionType } from './function-type.enum';

export interface FunctionCucumber extends Omit<Function, 'type'> {
  type: FunctionType.CUCUMBER;
  classpathDirectory: DynamicValueString;
  featureDirectory: DynamicValueString;
  cucumberOptions: DynamicValueString;
}
