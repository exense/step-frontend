import { Function } from '@exense/step-core';
import { FunctionType } from './function-type.enum';

export interface FunctionAstra extends Omit<Function, 'type'> {
  type: FunctionType.ASTRA;
}
