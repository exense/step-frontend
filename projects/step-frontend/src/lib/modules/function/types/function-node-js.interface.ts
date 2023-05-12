import { DynamicValueString, Function } from '@exense/step-core';
import { FunctionType } from './function-type.enum';

export interface FunctionNodeJS extends Omit<Function, 'type'> {
  type: FunctionType.NODE_JS;
  jsFile: DynamicValueString;
}
