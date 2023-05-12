import { Function } from '@exense/step-core';
import { FunctionConfigurationDialogForm } from './function-configuration-dialog.form';

export interface FunctionTypeContext {
  formGroup: FunctionConfigurationDialogForm;
  stepFunction?: Function;
}
