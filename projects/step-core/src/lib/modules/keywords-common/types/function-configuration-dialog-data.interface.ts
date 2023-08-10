import { Function as Keyword } from '../../../client/step-client-module';
import { FunctionDialogsConfig } from './function-dialogs-config.interface';

export interface FunctionConfigurationDialogData {
  keyword?: Keyword;
  dialogConfig: FunctionDialogsConfig;
}
