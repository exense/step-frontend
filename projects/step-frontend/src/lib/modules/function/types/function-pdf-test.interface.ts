import { DynamicValueString, Function } from '@exense/step-core';
import { FunctionType } from './function-type.enum';

export interface FunctionPDFTest extends Omit<Function, 'type'> {
  type: FunctionType.PDF_TEST;
  scenarioFile: DynamicValueString;
}
