import { Function } from '@exense/step-core';
import { FunctionDialogsConfig } from './function-dialogs-config.interface';

export interface FunctionConfigurationDialogData {
  stepFunction?: Function;
  dialogConfig: FunctionDialogsConfig;
}
