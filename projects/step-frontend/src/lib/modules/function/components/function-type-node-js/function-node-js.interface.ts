import { DynamicValueString, Keyword } from '@exense/step-core';

export interface FunctionNodeJS extends Keyword {
  jsFile: DynamicValueString;
}
