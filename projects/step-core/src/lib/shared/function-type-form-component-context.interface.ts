import { Observable } from 'rxjs';
import { Function } from '../client/generated';
import { FunctionConfigurationDialogForm } from './function-configuration-dialog.form';

export interface FunctionTypeFormComponentContext {
  formGroup: FunctionConfigurationDialogForm;
  stepFunction: Function;
  setValueToForm$: Observable<void>;
  setValueToModel$: Observable<void>;
}
