import { DynamicValueString, Function } from '@exense/step-core';
import { FunctionType } from './function-type.enum';

export interface FunctionSoapUI extends Omit<Function, 'type'> {
  type: FunctionType.SOAP_UI;
  projectFile: DynamicValueString;
  testSuite: DynamicValueString;
  testCase: DynamicValueString;
}
