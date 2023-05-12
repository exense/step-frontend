import { Function } from '@exense/step-core';
import { FunctionType } from './function-type.enum';

export interface FunctionComposite extends Omit<Function, 'type'> {
  type: FunctionType.COMPOSITE;
  planId: string;
}
