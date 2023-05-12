import { DynamicValueString, Function } from '@exense/step-core';
import { FunctionType } from './function-type.enum';

export interface FunctionDotnet extends Omit<Function, 'type'> {
  type: FunctionType.DOTNET;
  librariesFile: DynamicValueString;
  dllFile: DynamicValueString;
}
