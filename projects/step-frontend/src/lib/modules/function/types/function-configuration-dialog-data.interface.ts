import { Function as Keyword } from '@exense/step-core';
import { FunctionDialogsConfig } from './function-dialogs-config.interface';

export interface FunctionConfigurationDialogData {
  keyword?: Keyword;
  dialogConfig: FunctionDialogsConfig;
}
