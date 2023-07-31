import { Function as Keyword } from '../client/generated';
import { FunctionDialogsConfig } from './function-dialogs-config.interface';

export interface FunctionConfigurationDialogData {
  keyword?: Keyword;
  dialogConfig: FunctionDialogsConfig;
}
